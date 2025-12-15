"use client";

import { useEffect, useRef, useState } from "react";

export default function OfflineDashboard() {
  const [angle, setAngle] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 🔒 HARD GUARD
  const isOffline = window.location.hostname === "192.168.4.1";

  useEffect(() => {
    if (!isOffline) return;

    const ws = new WebSocket("ws://192.168.4.1:81");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      const value = parseFloat(e.data);
      if (!isNaN(value)) setAngle(value);
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => ws.close();

    return () => ws.close();
  }, [isOffline]);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "#2563eb" }}>KnexFlex — Offline</h1>

      <p>Status: {connected ? "Connected to Device" : "Disconnected"}</p>

      <h2 style={{ fontSize: 64 }}>
        {angle !== null ? `${angle.toFixed(2)}°` : "--"}
      </h2>

      <p style={{ marginTop: 20 }}>
        Live data streaming at 100 Hz directly from ESP
      </p>
    </div>
  );
}
