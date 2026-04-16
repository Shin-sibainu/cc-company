export default function InboxPreview({ data }) {
  const entries = data.insights?.inboxPreview || [];

  return (
    <div className="section">
      <div className="section-title">Inbox &mdash; latest captures</div>
      {entries.length === 0 ? (
        <div className="empty-state">No inbox entries yet</div>
      ) : (
        <div className="inbox-list">
          {entries.map((e, i) => (
            <div key={i} className="inbox-item">
              <span className="inbox-date">{formatShort(e.date)}</span>
              <span className="inbox-time">{e.time}</span>
              <span className="inbox-content">{e.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatShort(date) {
  if (!date || date.length < 10) return date || "";
  return date.slice(5);
}
