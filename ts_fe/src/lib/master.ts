export async function getMasterInfo() {
  const res = await fetch("/api/master");
  if (!res.ok) throw new Error("Failed to fetch master info");
  return res.json();
}

export async function updateMasterInfo(data: { sitename: string; projectname: string; year: number }) {
  const res = await fetch("/api/master", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update master info");
  return res.json();
}
