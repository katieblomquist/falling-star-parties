"use client";

import { useState } from "react";

type Status =
  | { type: "idle" }
  | { type: "loading"; action: string }
  | { type: "success"; action: string; squareInvoiceUrl?: string; gmailDraftId?: string }
  | { type: "error"; action: string; message: string };

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [notionPageId, setNotionPageId] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function trigger(action: "retainer" | "final-invoice") {
    // Extract a 32-char hex ID from anywhere in the input (handles full notion.so URLs
    // with one or two path segments, query params, etc.) and convert to UUID format.
    const raw = notionPageId.trim();
    const hexMatch = raw.match(/([a-f0-9]{32})(?:[^a-f0-9]|$)/i);
    const id = hexMatch
      ? `${hexMatch[1].slice(0, 8)}-${hexMatch[1].slice(8, 12)}-${hexMatch[1].slice(12, 16)}-${hexMatch[1].slice(16, 20)}-${hexMatch[1].slice(20)}`
      : raw; // fall through as-is (may already be a UUID with dashes)

    setStatus({ type: "loading", action });

    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notionPageId: id, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", action, message: data.error ?? `HTTP ${res.status}` });
        return;
      }

      setStatus({
        type: "success",
        action,
        squareInvoiceUrl: data.squareInvoiceUrl,
        gmailDraftId: data.gmailDraftId,
      });
    } catch (err) {
      setStatus({
        type: "error",
        action,
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  const loading = status.type === "loading";

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/logo.png" alt="Falling Star Parties" style={styles.logo} />
        <h1 style={styles.title}>Admin — Manual Triggers</h1>
        <p style={styles.subtitle}>
          Paste the Notion page ID or full Notion URL for the booking, enter your admin password, then choose an action.
        </p>

        <label style={styles.label}>Notion Page ID or URL</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. 1a2b3c4d-... or full notion.so URL"
          value={notionPageId}
          onChange={(e) => setNotionPageId(e.target.value)}
          disabled={loading}
        />

        <label style={styles.label}>Admin Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          disabled={loading}
        />

        <div style={styles.buttonRow}>
          <button
            style={{ ...styles.button, ...styles.buttonBlue }}
            onClick={() => trigger("retainer")}
            disabled={loading || !notionPageId.trim() || !secret}
          >
            {loading && status.action === "retainer" ? "Working..." : "Send Retainer Invoice & Email"}
          </button>

          <button
            style={{ ...styles.button, ...styles.buttonPurple }}
            onClick={() => trigger("final-invoice")}
            disabled={loading || !notionPageId.trim() || !secret}
          >
            {loading && status.action === "final-invoice" ? "Working..." : "Send Final Invoice & Email"}
          </button>
        </div>

        {status.type === "success" && (
          <div style={{ ...styles.banner, ...styles.bannerSuccess }}>
            <strong>{status.action === "retainer" ? "Retainer" : "Final invoice"} done!</strong>
            {status.squareInvoiceUrl && (
              <p style={styles.bannerLine}>
                Square invoice:{" "}
                <a href={status.squareInvoiceUrl} target="_blank" rel="noreferrer" style={styles.link}>
                  {status.squareInvoiceUrl}
                </a>
              </p>
            )}
            {status.gmailDraftId && (
              <p style={styles.bannerLine}>
                Gmail draft ID: <code style={styles.code}>{status.gmailDraftId}</code>
                {" — "}
                <a
                  href="https://mail.google.com/mail/u/0/#drafts"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Open Drafts
                </a>
              </p>
            )}
          </div>
        )}

        {status.type === "error" && (
          <div style={{ ...styles.banner, ...styles.bannerError }}>
            <strong>Error</strong>
            <p style={styles.bannerLine}>{status.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (no CSS module needed for an internal tool)
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    padding: "32px 16px",
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 2px 16px rgba(52,59,149,0.10)",
    padding: "40px 44px",
    maxWidth: 520,
    width: "100%",
  },
  logo: {
    display: "block",
    margin: "0 auto 20px",
    width: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#343B95",
    textAlign: "center",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    margin: "0 0 28px",
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 6,
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    fontSize: 14,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d0d0e0",
    marginBottom: 16,
    fontFamily: "inherit",
    outline: "none",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    marginTop: 4,
    flexWrap: "wrap",
  },
  button: {
    flex: 1,
    minWidth: 180,
    padding: "11px 16px",
    borderRadius: 50,
    border: "none",
    fontSize: 13,
    fontWeight: "bold",
    cursor: "pointer",
    letterSpacing: 0.3,
    transition: "opacity 0.15s",
  },
  buttonBlue: {
    background: "#343B95",
    color: "#fff",
  },
  buttonPurple: {
    background: "#7c3aed",
    color: "#fff",
  },
  banner: {
    marginTop: 24,
    padding: "14px 18px",
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.6,
  },
  bannerSuccess: {
    background: "#eefbf3",
    border: "1px solid #86efac",
    color: "#166534",
  },
  bannerError: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
  },
  bannerLine: {
    margin: "4px 0 0",
    wordBreak: "break-all",
  },
  link: {
    color: "inherit",
    textDecoration: "underline",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 12,
  },
};
