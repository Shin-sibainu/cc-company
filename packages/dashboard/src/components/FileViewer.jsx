import { useState, useEffect } from "react";

export default function FileViewer({ deptId, filePath, onClose }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setContent(null);
    setError(false);
    const fullPath = `${deptId}/${filePath}`;
    fetch(`/api/file?path=${encodeURIComponent(fullPath)}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setContent(data.content))
      .catch(() => setError(true));
  }, [deptId, filePath]);

  return (
    <div className="file-viewer" onClick={onClose}>
      <div className="file-viewer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="file-viewer-header">
          <span className="file-viewer-path">{deptId}/{filePath}</span>
          <button className="file-viewer-close" onClick={onClose}>&times;</button>
        </div>
        <div className="file-viewer-body">
          {error && <div className="empty-state">Failed to load file</div>}
          {!content && !error && <div className="empty-state">Loading...</div>}
          {content && <pre className="file-viewer-content">{content}</pre>}
        </div>
      </div>
    </div>
  );
}
