import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { fetchDepartment } from "../services/api";

export default function DepartmentDetail({ deptId, onBack }) {
  const [dept, setDept] = useState(null);
  const [error, setError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [previewMode, setPreviewMode] = useState("preview");

  useEffect(() => {
    setDept(null);
    setError(false);
    setSelectedFile(null);
    setFileContent(null);
    fetchDepartment(deptId)
      .then((data) => {
        setDept(data);
        if (data.files.length > 0) {
          selectFile(deptId, data.files[0].path);
        }
      })
      .catch(() => setError(true));
  }, [deptId]);

  const selectFile = (dept, filePath) => {
    setSelectedFile(filePath);
    setFileContent(null);
    fetch(`/api/file?path=${encodeURIComponent(`${dept}/${filePath}`)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setFileContent(data.content))
      .catch(() => setFileContent("Failed to load file"));
  };

  if (error) {
    return <div className="empty-state">Failed to load department data</div>;
  }

  if (!dept) {
    return <div className="empty-state">Loading...</div>;
  }

  return (
    <div className="dept-detail-view" key={deptId}>
      <div className="dept-detail-top">
        <h2 className="detail-title">{dept.name}</h2>
        <p className="detail-role">{dept.role}</p>
        <div className="detail-stats">
          <span className="detail-stat">{dept.files.length} files</span>
          {getStatusBadges(dept.files)}
        </div>
      </div>

      <div className="dept-split">
        <div className="dept-split-list">
          {dept.files.length === 0 ? (
            <div className="empty-state">No files yet</div>
          ) : (
            Object.entries(groupByFolder(dept.files)).map(([folder, files]) => (
              <FolderGroup
                key={folder}
                folder={folder}
                files={files}
                selectedFile={selectedFile}
                onSelectFile={(path) => selectFile(deptId, path)}
              />
            ))
          )}
        </div>

        <div className="dept-split-preview">
          {!selectedFile && (
            <div className="empty-state">Select a file to preview</div>
          )}
          {selectedFile && !fileContent && (
            <div className="empty-state">Loading...</div>
          )}
          {selectedFile && fileContent && (
            <>
              <div className="preview-header">
                <span className="preview-path">{selectedFile}</span>
                <div className="preview-tabs">
                  <button
                    className={`preview-tab ${previewMode === "preview" ? "active" : ""}`}
                    onClick={() => setPreviewMode("preview")}
                  >
                    Preview
                  </button>
                  <button
                    className={`preview-tab ${previewMode === "raw" ? "active" : ""}`}
                    onClick={() => setPreviewMode("raw")}
                  >
                    Markdown
                  </button>
                </div>
              </div>
              {previewMode === "raw" ? (
                <pre className="preview-content">{fileContent}</pre>
              ) : (
                <div className="preview-rendered">
                  <Markdown>{stripFrontmatter(fileContent)}</Markdown>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderGroup({ folder, files, selectedFile, onSelectFile }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="folder-group">
      <div className="folder-group-title" onClick={() => setOpen(!open)}>
        <span className={`folder-arrow ${open ? "open" : ""}`}>&#9654;</span>
        {folder}
        <span className="folder-count">{files.length}</span>
      </div>
      {open && files.map((f, i) => (
        <div
          key={i}
          className={`file-list-item ${selectedFile === f.path ? "active" : ""}`}
          onClick={() => onSelectFile(f.path)}
        >
          <div className="file-list-item-title">{f.title}</div>
          <div className="file-list-item-meta">
            {f.status && <span className="status-badge">{f.status}</span>}
            <span className="file-list-item-time">{timeAgo(f.modifiedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByFolder(files) {
  const groups = {};
  for (const f of files) {
    const parts = f.path.split("/");
    const folder = parts.length > 1 ? parts[0] : "/";
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(f);
  }
  return groups;
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, "");
}

function getStatusBadges(files) {
  const counts = {};
  files.forEach((f) => {
    if (f.status) counts[f.status] = (counts[f.status] || 0) + 1;
  });
  return Object.entries(counts).map(([s, c]) => (
    <span key={s} className="status-badge">{s}: {c}</span>
  ));
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
