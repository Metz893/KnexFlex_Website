"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "@/app/components/NavBar";

const DB_KEY = "knexflex_sessions";

type Sample = { t: number; angle: number };
type Session = { id: string; createdAt: number; data: Sample[] };

function loadSessions(): Session[] {
  return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
}
function saveSessions(s: Session[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(s));
}

export default function OfflineDashboard() {
  const [angle, setAngle] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const bufferRef = useRef<Sample[]>([]);
  const lastRender = useRef(0);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.4.1:81");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => ws.close();

    ws.onmessage = (e) => {
      const a = parseFloat(e.data);
      if (isNaN(a)) return;

      const now = performance.now();
      if (now - lastRender.current > 16) {
        setAngle(a);
        lastRender.current = now;
      }

      if (recording) {
        bufferRef.current.push({ t: Date.now(), angle: a });
        setSamples(bufferRef.current.length);
      }
    };

    return () => ws.close();
  }, [recording]);

  const start = () => {
    bufferRef.current = [];
    setSamples(0);
    setRecording(true);
  };

  const stop = () => setRecording(false);

  const save = () => {
    if (!bufferRef.current.length) return;
    const sessions = loadSessions();
    sessions.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      data: bufferRef.current,
    });
    saveSessions(sessions);
    bufferRef.current = [];
    setSamples(0);
    alert("Session saved locally");
  };

  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}>
        <h1>Offline Dashboard</h1>
        <p>Status: <strong>{connected ? "Connected" : "Disconnected"}</strong></p>

        <div style={{ fontSize: 56, margin: "20px 0" }}>
          {angle !== null ? `${angle.toFixed(2)}°` : "--"}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {!recording ? (
            <button onClick={start}>Start Recording</button>
          ) : (
            <button onClick={stop}>Stop Recording</button>
          )}
          <button onClick={save} disabled={recording || !samples}>
            Save Session
          </button>
        </div>

        {recording && <p>{samples} samples recorded</p>}
      </main>
    </>
  );
}
