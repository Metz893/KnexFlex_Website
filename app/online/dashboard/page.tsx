"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OnlineDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      const q = query(
        collection(db, "sessions"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    loadSessions();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "#2563eb" }}>KnexFlex — Cloud</h1>

      <p>Stored sessions:</p>

      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            {s.createdAt?.toDate?.().toLocaleString?.() ?? "Session"}
          </li>
        ))}
      </ul>
    </div>
  );
}
