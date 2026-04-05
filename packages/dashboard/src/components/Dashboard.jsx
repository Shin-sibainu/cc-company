import OverviewCards from "./OverviewCards";
import TodoList from "./TodoList";
import ActivityFeed from "./ActivityFeed";
import DepartmentSummary from "./DepartmentSummary";

export default function Dashboard({ data, onNavigate }) {
  return (
    <>
      <OverviewCards data={data} />
      <div className="two-col">
        <TodoList data={data} />
        <ActivityFeed data={data} />
      </div>
      <DepartmentSummary data={data} onNavigate={onNavigate} />
    </>
  );
}
