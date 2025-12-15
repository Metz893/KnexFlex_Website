"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@/components/Card";

const DB_KEY = "knexflex_sessions";

type Sample = { t: number; angle: number };
type Session = { id: string; createdAt: number; data: Sample[] };

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
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

  // =====================
  // WebSocket connection
  // =====================
  useEffect(() => {
    const ws = new WebSocket("ws://192.168.4.1:81");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => ws.close();

    ws.onmessage = (e) => {
      const value = parseFloat(e.data);
      if (isNaN(value)) return;

      const now = performance.now();
      if (now - lastRender.current > 16) {
        setAngle(value);
        lastRender.current = now;
      }

      if (recording) {
        bufferRef.current.push({
          t: Date.now(),
          angle: value,
        });
        setSamples(bufferRef.current.length);
      }
    };

    return () => ws.close();
  }, [recording]);

  // =====================
  // Controls
  // =====================
  const startRecording = () => {
    bufferRef.current = [];
    setSamples(0);
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const saveRecording = () => {
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

    alert("Session saved locally ✅");
  };

  // =====================
  // UI
  // =====================
  return (
    <>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Offline Live</h1>
          <p className="text-sm text-slate-600">
            Live angle streaming directly from your KnexFlex device.
          </p>
        </div>

        <Card
          title="Connection Status"
          right={
            <span
              className={`text-xs font-medium ${
                connected ? "text-green-600" : "text-red-600"
              }`}
            >
              {connected ? "Connected" : "Disconnected"}
            </span>
          }
        >
          <p className="text-sm text-slate-600">
            Make sure you are connected to the <b>KnexFlex</b> Wi-Fi network.
          </p>
        </Card>

        <Card title="Live Angle">
          <div className="flex flex-col items-center gap-3">
            <div className="text-[64px] font-semibold tracking-tight">
              {angle !== null ? `${angle.toFixed(2)}°` : "--"}
            </div>

            {recording && (
              <div className="text-sm text-slate-500">
                {samples} samples recorded
              </div>
            )}
          </div>
        </Card>

        <Card title="Recording Controls">
          <div className="flex flex-wrap gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Stop Recording
              </button>
            )}

            <button
              onClick={saveRecording}
              disabled={recording || samples === 0}
              className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Save Session
            </button>
          </div>
        </Card>
      </main>
    </>
  );
}
