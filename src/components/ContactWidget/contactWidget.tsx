"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./contactWidget.module.css";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const fabRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) { setIsOpen(false); resetForm(); }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        resetForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  // Focus first input when opened
  useEffect(() => {
    if (isOpen && formState === "idle") {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, formState]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setFormState("idle");
    setErrorMessage("");
  }

  if (pathname === "/book") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setFormState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setFormState("error");
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Popup */}
      {isOpen && (
        <div
          className={styles.popup}
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-label="Send us a message"
        >
          {/* Header */}
          <div className={styles.popupHeader}>
            <span className={styles.popupTitle}>Send Us a Message</span>
            <button
              className={styles.closeButton}
              onClick={() => { setIsOpen(false); resetForm(); }}
              aria-label="Close contact form"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className={styles.popupBody}>
            {formState === "success" ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✓</div>
                <p className={styles.successTitle}>Message Sent!</p>
                <p className={styles.successText}>
                  Thank you for reaching out. We&apos;ll get back to you soon!
                </p>
                <button
                  className={styles.sendAnotherButton}
                  onClick={resetForm}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="cw-name" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="cw-name"
                    ref={firstInputRef}
                    type="text"
                    className={styles.input}
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={formState === "loading"}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="cw-email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="cw-email"
                    type="email"
                    className={styles.input}
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={formState === "loading"}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="cw-message" className={styles.label}>
                    How can we help? <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="cw-message"
                    className={styles.textarea}
                    placeholder="Tell us about your event or question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={formState === "loading"}
                    rows={4}
                  />
                </div>

                {formState === "error" && (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={formState === "loading"}
                >
                  {formState === "loading" ? (
                    <span className={styles.spinner} aria-label="Sending…" />
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        ref={fabRef}
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ""}`}
        onClick={() => { setIsOpen((v) => !v); if (isOpen) resetForm(); }}
        aria-label={isOpen ? "Close contact form" : "Open contact form"}
      >
        {isOpen ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4L16 16M16 4L4 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          // Envelope icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
            <path d="M2 7l10 7 10-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
