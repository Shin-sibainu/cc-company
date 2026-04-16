import { useState, useEffect, useMemo } from "react";
import { fetchDashboard } from "./services/api";
import { useSSE } from "./services/useSSE";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DepartmentDetail from "./components/DepartmentDetail";
import FileTree from "./components/FileTree";
import GraphView from "./components/GraphView";
import Search from "./components/Search";
import "./App.css";

const VIEW_TITLES = {
  dashboard: "Dashboard",
  explorer: "Explorer",
  graph: "Graph",
  search: "Search",
};

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

  const connected = useSSE((newData) => setData(newData));

  const navigate = (type, deptId) => {
    setView(deptId ? { type, deptId } : { type });
    setSidebarOpen(false);
  };

  const deptNameById = useMemo(() => {
    const map = {};
    (data?.departments || []).forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [data]);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("search");
      } else if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  if (!data) {
    return <div className="loading">Loading...</div>;
  }

  const pageTitle =
    view.type === "department"
      ? deptNameById[view.deptId] || view.deptId
      : VIEW_TITLES[view.type] || "";

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
          <h2 className="page-title">{pageTitle}</h2>
          <button
            className="search-shortcut"
            onClick={() => navigate("search")}
            title="Search (⌘K)"
          >
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? "☀" : "☽"}
          </button>
          <div
            className={`connection-status ${connected ? "" : "disconnected"}`}
            title={connected ? "Live updates on" : "Disconnected"}
          />
        </header>
        <div className="content">
          {view.type === "dashboard" && <Dashboard data={data} onNavigate={navigate} />}
          {view.type === "explorer" && <FileTree data={data} onNavigate={navigate} />}
          {view.type === "graph" && <GraphView data={data} />}
          {view.type === "search" && <Search onNavigate={navigate} />}
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
