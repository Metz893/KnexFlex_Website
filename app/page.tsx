"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<
    "checking" | "offline" | "online"
  >("checking");

  useEffect(() => {
    let decided = false;

    const ws = new WebSocket("ws://192.168.4.1:81");

    const timeout = setTimeout(() => {
      if (!decided) {
        decided = true;
        setStatus("online");
        window.location.href = "/online/dashboard";
        ws.close();
      }
    }, 800);

    ws.onopen = () => {
      if (decided) return;
      decided = true;
      clearTimeout(timeout);
      setStatus("offline");
      window.location.href = "/offline/dashboard";
      ws.close();
    };

    ws.onerror = () => {
      // handled by timeout
    };

    return () => {
      clearTimeout(timeout);
      ws.close();
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#fafafa",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: 12 }}>KnexFlex</h1>

        {status === "checking" && <p>Detecting device…</p>}
        {status === "offline" && <p>Connecting to device…</p>}
        {status === "online" && <p>Loading cloud dashboard…</p>}
      </div>
    </div>
  );
}
