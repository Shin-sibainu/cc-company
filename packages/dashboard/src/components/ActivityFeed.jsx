export default function ActivityFeed({ data }) {
  const activities = data.recentActivity || [];

  return (
    <div className="section">
      <div className="section-title">Recent Activity</div>
      {activities.length === 0 ? (
        <div className="empty-state">No recent activity</div>
      ) : (
        activities.slice(0, 15).map((a, i) => (
          <div key={i} className="activity-item">
            <span className="activity-dept">{a.department}</span>
            <span className="activity-file">{a.file}</span>
            <span className="activity-time">{timeAgo(a.modifiedAt)}</span>
          </div>
        ))
      )}
    </div>
  );
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
