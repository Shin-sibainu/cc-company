import OverviewCards from "./OverviewCards";
import TodoList from "./TodoList";
import ActivityFeed from "./ActivityFeed";
import DepartmentSummary from "./DepartmentSummary";
import WeeklyHeatmap from "./WeeklyHeatmap";
import TodoTrend from "./TodoTrend";
import InboxPreview from "./InboxPreview";

export default function Dashboard({ data, onNavigate }) {
  return (
    <>
      <OverviewCards data={data} />
      <WeeklyHeatmap data={data} />
      <div className="two-col">
        <TodoList data={data} />
        <TodoTrend data={data} />
      </div>
      <div className="two-col">
        <InboxPreview data={data} />
        <ActivityFeed data={data} />
      </div>
      <DepartmentSummary data={data} onNavigate={onNavigate} />
    </>
  );
}
