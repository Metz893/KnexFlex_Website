"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"checking" | "offline" | "online">(
    "checking"
  );

  useEffect(() => {
    // If loaded from ESP IP → OFFLINE
    if (window.location.hostname === "192.168.4.1") {
      setStatus("offline");
      window.location.replace("/offline/dashboard");
    } else {
      // Anything else (Vercel, localhost, phone data)
      setStatus("online");
      window.location.replace("/online/dashboard");
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p>
        {status === "checking" && "Detecting connection…"}
        {status === "offline" && "Connecting to device…"}
        {status === "online" && "Loading cloud dashboard…"}
      </p>
    </div>
  );
}
