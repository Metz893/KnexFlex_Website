"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

const DB_KEY = "knexflex_sessions";

type Sample = { t: number; angle: number };
type Session = { id: string; createdAt: number; data: Sample[] };

export default function OfflineSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(JSON.parse(localStorage.getItem(DB_KEY) || "[]"));
  }, []);

  const download = (s: Session) => {
    const rows = s.data.map(d => `${d.t},${d.angle}`).join("\n");
    const csv = `Time,Angle\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `knexflex_${s.createdAt}.csv`;
    a.click();
  };

  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
        <h1>Offline Sessions</h1>

        {sessions.length === 0 && <p>No sessions saved.</p>}

        {sessions.map(s => (
          <div key={s.id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
            <strong>{new Date(s.createdAt).toLocaleString()}</strong>
            <div>{s.data.length} samples</div>
            <button onClick={() => download(s)}>Download CSV</button>
          </div>
        ))}
      </main>
    </>
  );
}
