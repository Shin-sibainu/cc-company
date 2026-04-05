export default function DepartmentSummary({ data, onNavigate }) {
  const departments = data.departments || [];
  const stats = data.departmentStats || {};

  return (
    <div className="section">
      <div className="section-title">Departments</div>
      {departments.length === 0 ? (
        <div className="empty-state">No departments found</div>
      ) : (
        <div className="dept-grid">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="dept-card"
              onClick={() => onNavigate("department", dept.id)}
            >
              <div className="dept-card-name">{dept.name}</div>
              <div className="dept-card-role">{dept.role}</div>
              <div className="dept-card-files">{dept.fileCount} files</div>
              {stats[dept.id] && (
                <div className="status-bar">
                  {Object.entries(stats[dept.id]).map(([status, count]) => (
                    <span key={status} className="status-badge">
                      {status}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
