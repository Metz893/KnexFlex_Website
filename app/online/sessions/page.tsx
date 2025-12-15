"use client";

import { useEffect, useState } from "react";
import NavBar from "@/app/components/NavBar";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// =====================
// Types
// =====================
type Sample = {
  t: number;
  angle: number;
};

type CloudSession = {
  id: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  localCreatedAt?: number;
  data: Sample[];
};

// =====================
// Online Sessions Page
// =====================
export default function OnlineSessions() {
  const [sessions, setSessions] = useState<CloudSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "sessions"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const list: CloudSession[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        setSessions(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =====================
  // Helpers
  // =====================
  const formatDate = (s: CloudSession) => {
    if (s.createdAt?.seconds) {
      return new Date(s.createdAt.seconds * 1000).toLocaleString();
    }
    if (s.localCreatedAt) {
      return new Date(s.localCreatedAt).toLocaleString();
    }
    return "Unknown date";
  };

  const downloadCSV = (session: CloudSession) => {
    const header = "Time(ms),Angle(deg)";
    const rows = session.data.map(
      (d) => `${d.t},${d.angle}`
    );
    const csv = `${header}\n${rows.join("\n")}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `knexflex_cloud_${session.id}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // =====================
  // UI
  // =====================
  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 40,
          fontFamily: "system-ui",
        }}
      >
        <h1>KnexFlex – Online Sessions</h1>

        <p style={{ color: "#555" }}>
          These sessions are stored securely in the cloud.
        </p>

        {loading && <p>Loading sessions…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !sessions.length && (
          <p>No sessions uploaded yet.</p>
        )}

        {!loading && sessions.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 20,
            }}
          >
            <thead>
              <tr>
                <th align="left">Date</th>
                <th align="right">Samples</th>
                <th align="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td>{formatDate(s)}</td>
                  <td align="right">{s.data.length}</td>
                  <td align="right">
                    <button
                      onClick={() => downloadCSV(s)}
                    >
                      Download CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
