import { useState, useEffect } from "react";

export default function FileTree({ data, onNavigate }) {
  const departments = data.departments || [];
  const [tree, setTree] = useState(null);

  useEffect(() => {
    fetch("/api/tree")
      .then((r) => r.json())
      .then(setTree)
      .catch(() => setTree(null));
  }, [data]);

  if (!tree) {
    return <div className="empty-state">Loading...</div>;
  }

  return (
    <div className="filetree-view">
      <div className="dept-detail-top">
        <h2 className="detail-title">File Explorer</h2>
        <p className="detail-role">.company/ の全体構造</p>
      </div>
      <div className="filetree-container">
        <div className="filetree">
          <div className="filetree-root">.company/</div>
          {tree.map((node) => (
            <TreeNode key={node.name} node={node} depth={1} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, depth, onNavigate, parentDept }) {
  const [open, setOpen] = useState(depth <= 2);

  // depth 1 = department folder
  const deptId = depth === 1 ? node.name : parentDept;

  if (node.type === "file") {
    return (
      <div
        className="filetree-file filetree-file-clickable"
        style={{ paddingLeft: depth * 20 }}
        onClick={() => onNavigate && onNavigate("department", deptId)}
      >
        <span className="filetree-file-icon">&#9643;</span>
        <span className="filetree-file-name">{node.name}</span>
        {node.status && <span className="status-badge">{node.status}</span>}
      </div>
    );
  }

  return (
    <div className="filetree-folder-wrapper">
      <div
        className="filetree-folder"
        style={{ paddingLeft: depth * 20 }}
        onClick={() => setOpen(!open)}
      >
        <span className={`filetree-arrow ${open ? "open" : ""}`}>&#9654;</span>
        <span className="filetree-folder-name">{node.displayName || node.name}</span>
        <span className="filetree-folder-count">{node.fileCount}</span>
      </div>
      {open && node.children && node.children.map((child) => (
        <TreeNode key={child.name} node={child} depth={depth + 1} onNavigate={onNavigate} parentDept={deptId} />
      ))}
    </div>
  );
}
