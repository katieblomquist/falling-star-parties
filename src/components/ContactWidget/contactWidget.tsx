"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRecaptchaV3 } from "@/lib/useRecaptchaV3";
import styles from "./contactWidget.module.css";

const NAME_MAX = 100;
const MESSAGE_MAX = 2000;

type FormState = "idle" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const popupRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const executeRecaptcha = useRecaptchaV3("contact");

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
    setFieldErrors({});
  }

  if (pathname === "/book") return null;

  function validate(): boolean {
    const errors: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) {
      errors.name = "Full name is required.";
    } else if (name.trim().length > NAME_MAX) {
      errors.name = `Name must be ${NAME_MAX} characters or fewer.`;
    }
    if (!email.trim() || !isValidEmail(email.trim())) {
      errors.email = "A valid email address is required.";
    }
    if (!message.trim()) {
      errors.message = "Message is required.";
    } else if (message.trim().length > MESSAGE_MAX) {
      errors.message = `Message must be ${MESSAGE_MAX} characters or fewer.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setFormState("loading");
    setErrorMessage("");

    try {
      const recaptchaToken = await executeRecaptcha();
      if (!recaptchaToken) {
        setErrorMessage("reCAPTCHA verification failed. Please try again.");
        setFormState("error");
        return;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, recaptchaToken }),
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
                    className={`${styles.input}${fieldErrors.name ? ` ${styles.inputError}` : ""}`}
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    maxLength={NAME_MAX + 1}
                    disabled={formState === "loading"}
                  />
                  {fieldErrors.name && (
                    <p className={styles.fieldError}>{fieldErrors.name}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="cw-email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="cw-email"
                    type="email"
                    className={`${styles.input}${fieldErrors.email ? ` ${styles.inputError}` : ""}`}
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    disabled={formState === "loading"}
                  />
                  {fieldErrors.email && (
                    <p className={styles.fieldError}>{fieldErrors.email}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="cw-message" className={styles.label}>
                      How can we help? <span className={styles.required}>*</span>
                    </label>
                    <span className={`${styles.charCount}${message.length > MESSAGE_MAX ? ` ${styles.charCountOver}` : ""}`}>
                      {message.length}/{MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="cw-message"
                    className={`${styles.textarea}${fieldErrors.message ? ` ${styles.inputError}` : ""}`}
                    placeholder="Tell us about your event or question..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    disabled={formState === "loading"}
                    rows={4}
                  />
                  {fieldErrors.message && (
                    <p className={styles.fieldError}>{fieldErrors.message}</p>
                  )}
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
