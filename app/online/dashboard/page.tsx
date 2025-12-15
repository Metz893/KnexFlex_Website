"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import NavBar from "@/app/components/NavBar";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DB_KEY = "knexflex_sessions";

export default function OnlineDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setSessions(JSON.parse(localStorage.getItem(DB_KEY) || "[]"));
  }, []);

  const uploadAll = async () => {
    setUploading(true);
    const updated = [...sessions];

    for (const s of updated.filter(x => !x.uploaded)) {
      await addDoc(collection(db, "sessions"), {
        createdAt: serverTimestamp(),
        localCreatedAt: s.createdAt,
        data: s.data,
      });
      s.uploaded = true;
    }

    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    setSessions(updated);
    setUploading(false);
  };

  const pending = sessions.filter(s => !s.uploaded);

  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
        <h1>Online Dashboard</h1>
        <p>{pending.length} sessions ready to upload</p>

        <button onClick={uploadAll} disabled={!pending.length || uploading}>
          Upload Sessions
        </button>
      </main>
    </>
  );
}
