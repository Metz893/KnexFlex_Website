"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isOffline = pathname.startsWith("/offline");
  const isOnline = pathname.startsWith("/online");
  const base = isOffline ? "/offline" : "/online";

  // =====================
  // Mode switching
  // =====================
  const switchMode = () => {
    if (isOffline) {
      // Try switching to ONLINE
      testInternet()
        .then(() => {
          window.location.href = "/online/dashboard";
        })
        .catch(() => {
          alert("No internet connection available.");
        });
    } else {
      // Try switching to OFFLINE
      testESP()
        .then(() => {
          window.location.href = "/offline/dashboard";
        })
        .catch(() => {
          alert("KnexFlex device not reachable. Connect to KnexFlex Wi-Fi.");
        });
    }
  };

  return (
    <nav
      style={{
        width: "100%",
        padding: "14px 24px",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "system-ui",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ fontSize: 18, color: "#2980b9" }}>KnexFlex</strong>
        {isOffline && badge("OFFLINE", "#f1c40f", "#000")}
        {isOnline && badge("ONLINE", "#2ecc71", "#fff")}
      </div>

      {/* Right */}
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <NavLink href={`${base}/dashboard`} label="Dashboard" />
        <NavLink href={`${base}/sessions`} label="Sessions" />

        <button
          onClick={switchMode}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ff0000ff",
            background: "#c91f1fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {isOffline ? "Switch to Online" : "Switch to Offline"}
        </button>
      </div>
    </nav>
  );
}

// =====================
// Helpers
// =====================
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        fontWeight: 600,
        color: active ? "#2980b9" : "#444",
      }}
    >
      {label}
    </Link>
  );
}

function badge(text: string, bg: string, color: string) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 8px",
        borderRadius: 6,
        background: bg,
        color,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  );
}

// =====================
// Connectivity tests
// =====================
function testESP(): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://192.168.4.1:81");

    const timeout = setTimeout(() => {
      ws.close();
      reject();
    }, 800);

    ws.onopen = () => {
      clearTimeout(timeout);
      ws.close();
      resolve();
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject();
    };
  });
}

function testInternet(): Promise<void> {
  return fetch("https://www.google.com", { mode: "no-cors" })
    .then(() => {})
    .catch(() => Promise.reject());
}
