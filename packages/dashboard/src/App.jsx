import { useState, useEffect } from "react";
import { fetchDashboard } from "./services/api";
import { useSSE } from "./services/useSSE";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DepartmentDetail from "./components/DepartmentDetail";
import "./App.css";

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState({ type: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cc-theme") || "light";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cc-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    fetchDashboard().then(setData).catch(console.error);
  }, []);

  useSSE((newData) => setData(newData));

  const navigate = (type, deptId) => {
    setView(deptId ? { type, deptId } : { type });
    setSidebarOpen(false);
  };

  if (!data) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Sidebar
        data={data}
        view={view}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            &#9776;
          </button>
          <h2 className="page-title">
            {view.type === "dashboard" ? "Dashboard" : view.deptId || ""}
          </h2>
          <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? "☀" : "☽"}
          </button>
          <div className="connection-status" />
        </header>
        <div className="content">
          {view.type === "dashboard" && <Dashboard data={data} onNavigate={navigate} />}
          {view.type === "department" && (
            <DepartmentDetail
              deptId={view.deptId}
              onBack={() => navigate("dashboard")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
