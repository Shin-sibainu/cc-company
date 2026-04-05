export default function Sidebar({ data, view, onNavigate, open, onClose }) {
  const org = data.organization || {};
  const departments = data.departments || [];

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-dot" />
          cc-company
        </div>
        <button className="menu-close" onClick={onClose}>&times;</button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>
        <div
          className={`sidebar-item ${view.type === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          &#9632; Dashboard
        </div>
        <div
          className={`sidebar-item ${view.type === "explorer" ? "active" : ""}`}
          onClick={() => onNavigate("explorer")}
        >
          &#9776; Explorer
        </div>
        <div
          className={`sidebar-item ${view.type === "graph" ? "active" : ""}`}
          onClick={() => onNavigate("graph")}
        >
          &#10023; Graph
        </div>
        <div
          className={`sidebar-item ${view.type === "search" ? "active" : ""}`}
          onClick={() => onNavigate("search")}
        >
          &#8981; Search
        </div>
      </div>

      {org.business && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Organization</div>
          <div className="sidebar-item" style={{ color: "var(--text-muted)", fontSize: 12, cursor: "default" }}>
            {org.business}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section-title">Departments</div>
        {departments.map((dept) => (
          <div
            key={dept.id}
            className={`sidebar-item ${view.type === "department" && view.deptId === dept.id ? "active" : ""}`}
            onClick={() => onNavigate("department", dept.id)}
          >
            <span className="sidebar-dot" />
            <span>{dept.name}</span>
            <span className="sidebar-count">{dept.fileCount}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section sidebar-links">
        <div className="sidebar-section-title">Links</div>
        <a href="https://shin-sibainu.github.io/cc-company/" target="_blank" rel="noopener" className="sidebar-item sidebar-link">
          &#9758; Docs
        </a>
        <a href="https://github.com/Shin-sibainu/cc-company" target="_blank" rel="noopener" className="sidebar-item sidebar-link">
          &#9758; GitHub
        </a>
      </div>
    </aside>
  );
}
