export async function fetchDashboard() {
  const res = await fetch("/api/dashboard");
  return res.json();
}

export async function fetchDepartment(id) {
  const res = await fetch(`/api/department/${id}`);
  if (!res.ok) throw new Error("Department not found");
  return res.json();
}
