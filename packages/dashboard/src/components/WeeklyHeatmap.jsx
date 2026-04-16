export default function WeeklyHeatmap({ data }) {
  const heatmap = data.insights?.heatmap || [];
  if (heatmap.length === 0) {
    return null;
  }

  const max = Math.max(1, ...heatmap.map((d) => d.count));
  const total = heatmap.reduce((s, d) => s + d.count, 0);
  const activeDays = heatmap.filter((d) => d.count > 0).length;

  return (
    <div className="section heatmap-section">
      <div className="section-title">Activity &mdash; last {heatmap.length} days</div>
      <div className="heatmap-meta">
        <span className="heatmap-stat">
          <b>{total}</b> edits
        </span>
        <span className="heatmap-stat">
          <b>{activeDays}</b> active days
        </span>
        <span className="heatmap-stat">
          <b>{heatmap[heatmap.length - 1]?.count || 0}</b> today
        </span>
      </div>
      <div className="heatmap-grid">
        {heatmap.map((d) => (
          <HeatCell key={d.date} date={d.date} count={d.count} max={max} />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>less</span>
        <span className="heat-cell" data-level="0" />
        <span className="heat-cell" data-level="1" />
        <span className="heat-cell" data-level="2" />
        <span className="heat-cell" data-level="3" />
        <span className="heat-cell" data-level="4" />
        <span>more</span>
      </div>
    </div>
  );
}

function HeatCell({ date, count, max }) {
  const level =
    count === 0 ? 0 : count >= max ? 4 : Math.min(4, Math.ceil((count / max) * 4));
  const label = `${date}: ${count} ${count === 1 ? "edit" : "edits"}`;
  return <span className="heat-cell" data-level={level} title={label} />;
}
