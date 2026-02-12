import { useCallback } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

export const useRecaptchaV3 = (action: string) => {
  return useCallback(async (): Promise<string | null> => {
    if (!SITE_KEY) {
      console.error("[reCAPTCHA] Site key is missing (NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY)");
      return null;
    }
    // Ensure grecaptcha is loaded
    if (!(window as any).grecaptcha) {
      console.log("[reCAPTCHA] grecaptcha not found, injecting script...");
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.async = true;
        script.onload = () => {
          console.log("[reCAPTCHA] Script loaded successfully.");
          resolve(null);
        };
        script.onerror = (e) => {
          console.error("[reCAPTCHA] Failed to load script.", e);
          reject(new Error("Failed to load reCAPTCHA script"));
        };
        document.body.appendChild(script);
      });
    }

    // Wait for grecaptcha to be ready
    console.log("[reCAPTCHA] Waiting for grecaptcha to be ready...");
    await new Promise((resolve) => {
      if ((window as any).grecaptcha && (window as any).grecaptcha.ready) {
        (window as any).grecaptcha.ready(resolve);
      } else {
        // Fallback: wait a bit and check again
        setTimeout(() => {
          if ((window as any).grecaptcha && (window as any).grecaptcha.ready) {
            (window as any).grecaptcha.ready(resolve);
          } else {
            resolve(null);
          }
        }, 500);
      }
    });

    if (!(window as any).grecaptcha || !(window as any).grecaptcha.execute) {
      console.error("[reCAPTCHA] grecaptcha or grecaptcha.execute is not available after initialization.");
      return null;
    }

    try {
      console.log("[reCAPTCHA] Executing grecaptcha with action:", action);
      const token = await (window as any).grecaptcha.execute(SITE_KEY, { action });
      if (!token) {
        console.error("[reCAPTCHA] grecaptcha.execute returned no token.");
      } else {
        console.log("[reCAPTCHA] Token generated successfully.");
      }
      return token;
    } catch (err) {
      console.error("[reCAPTCHA] Error during grecaptcha.execute", err);
      return null;
    }
  }, [action]);
};