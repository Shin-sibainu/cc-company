import { useRef, useEffect, useState } from "react";

export default function GraphView({ data }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const nodes = [];
    const links = [];

    // Build nodes from data
    const centerNode = {
      id: "company",
      label: ".company",
      type: "root",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 20,
      color: "#818cf8",
    };
    nodes.push(centerNode);

    const deptColors = {
      secretary: "#34d399",
      pm: "#60a5fa",
      research: "#a78bfa",
      marketing: "#f472b6",
      engineering: "#fb923c",
      finance: "#fbbf24",
      sales: "#2dd4bf",
      creative: "#e879f9",
      hr: "#38bdf8",
    };

    (data.departments || []).forEach((dept) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 60;
      const deptNode = {
        id: dept.id,
        label: dept.name,
        type: "dept",
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 14,
        color: deptColors[dept.id] || "#818cf8",
        fileCount: dept.fileCount,
      };
      nodes.push(deptNode);
      links.push({ source: "company", target: dept.id });

      // Add file nodes for each subfolder
      (dept.subfolders || []).forEach((sub, si) => {
        const subAngle = angle + (si - 1) * 0.5;
        const subDist = dist + 80 + Math.random() * 40;
        const subNode = {
          id: `${dept.id}/${sub}`,
          label: sub,
          type: "folder",
          x: Math.cos(subAngle) * subDist,
          y: Math.sin(subAngle) * subDist,
          vx: 0,
          vy: 0,
          radius: 8,
          color: deptColors[dept.id] || "#818cf8",
        };
        nodes.push(subNode);
        links.push({ source: dept.id, target: subNode.id });
      });
    });

    // Force simulation
    const simulation = {
      nodes,
      links,
      alpha: 1,
    };

    function tick() {
      const { nodes, links } = simulation;

      // Center gravity
      for (const node of nodes) {
        if (node.type === "root") continue;
        node.vx -= node.x * 0.0005;
        node.vy -= node.y * 0.0005;
      }

      // Link force
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = source.type === "root" ? 160 : 100;
        const force = (dist - targetDist) * 0.002;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        target.vx -= fx;
        target.vy -= fy;
        source.vx += fx;
        source.vy += fy;
      }

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = (a.radius + b.radius) * 3;

          if (dist < minDist) {
            const force = (minDist - dist) * 0.02;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // Apply velocity
      for (const node of nodes) {
        if (node.type === "root" || node.fixed) continue;
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;
      }

      simulation.alpha = Math.max(simulation.alpha * 0.995, 0.005);
    }

    // Camera
    let camX = 0, camY = 0, camZoom = 1;
    let dragging = null;
    let panning = false;
    let panStartX = 0, panStartY = 0;

    function screenToWorld(sx, sy) {
      return {
        x: (sx - canvas.width / 2) / camZoom + camX,
        y: (sy - canvas.height / 2) / camZoom + camY,
      };
    }

    function worldToScreen(wx, wy) {
      return {
        x: (wx - camX) * camZoom + canvas.width / 2,
        y: (wy - camY) * camZoom + canvas.height / 2,
      };
    }

    function getNodeAt(wx, wy) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = wx - n.x;
        const dy = wy - n.y;
        if (dx * dx + dy * dy < (n.radius + 4) * (n.radius + 4)) return n;
      }
      return null;
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    function draw() {
      resize();
      if (simulation.alpha > 0.01) tick();

      const isDark = document.documentElement.getAttribute("data-theme") !== "light";

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Links
      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (!source || !target) continue;

        const s = worldToScreen(source.x, source.y);
        const t = worldToScreen(target.x, target.y);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isDark ? "rgba(99, 118, 163, 0.15)" : "rgba(15, 23, 42, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const { x, y } = worldToScreen(node.x, node.y);
        const r = node.radius * camZoom;
        const isHovered = hoveredNode === node.id;

        // Glow
        if (node.type !== "folder" || isHovered) {
          ctx.beginPath();
          ctx.arc(x, y, r + (isHovered ? 8 : 4), 0, Math.PI * 2);
          ctx.fillStyle = node.color + (isHovered ? "30" : "15");
          ctx.fill();
        }

        // Circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#0c1019" : "#ffffff";
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label
        if (camZoom > 0.5 || node.type !== "folder") {
          ctx.font = `${node.type === "root" ? 600 : node.type === "dept" ? 500 : 400} ${
            (node.type === "folder" ? 10 : 12) * Math.min(camZoom, 1.5)
          }px 'Instrument Sans', sans-serif`;
          ctx.fillStyle = isDark ? (isHovered ? "#f0f2f7" : "#9ba3b8") : (isHovered ? "#0f172a" : "#475569");
          ctx.textAlign = "center";
          ctx.fillText(node.label, x, y + r + 14 * camZoom);
        }
      }

      stateRef.current = { nodes, links };
      requestAnimationFrame(draw);
    }

    // Events
    canvas.addEventListener("mousedown", (e) => {
      const { x, y } = screenToWorld(e.offsetX, e.offsetY);
      const node = getNodeAt(x, y);
      if (node) {
        dragging = node;
        simulation.alpha = 0.3;
      } else {
        panning = true;
        panStartX = e.offsetX;
        panStartY = e.offsetY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      const { x, y } = screenToWorld(e.offsetX, e.offsetY);

      if (dragging) {
        const dx = x - dragging.x;
        const dy = y - dragging.y;
        dragging.x = x;
        dragging.y = y;
        dragging.vx = 0;
        dragging.vy = 0;

        // Move connected unfixed nodes along
        for (const link of links) {
          let child = null;
          if (link.source === dragging.id) child = nodes.find((n) => n.id === link.target);
          if (child && !child.fixed) {
            child.x += dx * 0.6;
            child.y += dy * 0.6;
          }
        }

        simulation.alpha = Math.max(simulation.alpha, 0.1);
      } else if (panning) {
        camX -= (e.offsetX - panStartX) / camZoom;
        camY -= (e.offsetY - panStartY) / camZoom;
        panStartX = e.offsetX;
        panStartY = e.offsetY;
      } else {
        const node = getNodeAt(x, y);
        setHoveredNode(node ? node.id : null);
        canvas.style.cursor = node ? "grab" : "default";
      }
    });

    const handleMouseUp = () => {
      if (dragging) {
        dragging.fixed = true;
      }
      dragging = null;
      panning = false;
    };
    document.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      camZoom = Math.max(0.3, Math.min(3, camZoom * zoomFactor));
    }, { passive: false });

    draw();

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [data]);

  return (
    <div className="graph-view">
      <div className="dept-detail-top">
        <h2 className="detail-title">Graph View</h2>
        <p className="detail-role">ドラッグで移動、スクロールでズーム</p>
      </div>
      <div className="graph-canvas-wrapper">
        <canvas ref={canvasRef} className="graph-canvas" />
      </div>
    </div>
  );
}
