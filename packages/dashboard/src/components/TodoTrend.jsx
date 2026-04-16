export default function TodoTrend({ data }) {
  const trend = data.insights?.todoTrend || [];
  if (trend.length === 0) return null;

  const max = Math.max(1, ...trend.map((d) => d.total));
  const totalComplete = trend.reduce((s, d) => s + d.complete, 0);
  const totalAll = trend.reduce((s, d) => s + d.total, 0);
  const rate = totalAll > 0 ? Math.round((totalComplete / totalAll) * 100) : 0;

  return (
    <div className="section trend-section">
      <div className="section-title">
        TODO trend &mdash; {rate}% completed ({totalComplete}/{totalAll})
      </div>
      <div className="trend-chart">
        {trend.map((d) => {
          const completeH = (d.complete / max) * 100;
          const incompleteH = (d.incomplete / max) * 100;
          const day = d.date.slice(5);
          return (
            <div key={d.date} className="trend-bar-wrap" title={`${d.date} — ${d.complete} done / ${d.incomplete} open`}>
              <div className="trend-bar">
                <div className="trend-bar-incomplete" style={{ height: `${incompleteH}%` }} />
                <div className="trend-bar-complete" style={{ height: `${completeH}%` }} />
              </div>
              <div className="trend-bar-label">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
