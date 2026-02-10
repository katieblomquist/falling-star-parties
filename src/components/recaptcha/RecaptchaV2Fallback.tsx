'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './recaptcha.module.css';

const V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? '';

interface RecaptchaV2FallbackProps {
    onVerify: (token: string) => void;
}

export default function RecaptchaV2Fallback({ onVerify }: RecaptchaV2FallbackProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);
    const scriptLoadedRef = useRef(false);

    const renderWidget = useCallback(() => {
        if (
            containerRef.current &&
            widgetIdRef.current === null &&
            typeof window !== 'undefined' &&
            (window as any).grecaptcha?.render
        ) {
            try {
                widgetIdRef.current = (window as any).grecaptcha.render(containerRef.current, {
                    sitekey: V2_SITE_KEY,
                    callback: (token: string) => {
                        onVerify(token);
                    },
                });
            } catch {
                // Widget may already be rendered
            }
        }
    }, [onVerify]);

    useEffect(() => {
        // Check if the v2 script is already loaded
        if ((window as any).grecaptcha?.render) {
            renderWidget();
            return;
        }

        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        // Load the reCAPTCHA v2 script (separate from v3)
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaV2Load&render=explicit`;
        script.async = true;
        script.defer = true;

        (window as any).onRecaptchaV2Load = () => {
            renderWidget();
        };

        document.head.appendChild(script);

        return () => {
            delete (window as any).onRecaptchaV2Load;
        };
    }, [renderWidget]);

    return (
        <div className={styles.captchaContainer}>
            <p className={styles.captchaMessage}>
                Please verify you are human to submit your request:
            </p>
            <div ref={containerRef} className={styles.captchaWidget} />
        </div>
    );
}
