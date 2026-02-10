'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const SCORE_THRESHOLD = 0.5;

interface RecaptchaState {
    /** Whether v3 background verification passed */
    v3Verified: boolean;
    /** Whether v2 checkbox fallback was completed */
    v2Verified: boolean;
    /** Whether the user is verified by either method */
    isVerified: boolean;
    /** Whether v2 fallback is required (v3 failed or not yet resolved) */
    requiresV2Fallback: boolean;
    /** Whether v3 verification is still in progress */
    isLoading: boolean;
    /** Token to send to the server on form submission */
    captchaToken: string | null;
    /** The version of captcha that produced the token */
    captchaVersion: 'v3' | 'v2' | null;
    /** Callback for when v2 checkbox is completed */
    onV2Verify: (token: string) => void;
    /** Manually trigger a v3 verification attempt */
    retryV3: () => void;
}

export function useRecaptcha(): RecaptchaState {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [v3Verified, setV3Verified] = useState(false);
    const [v2Verified, setV2Verified] = useState(false);
    const [requiresV2Fallback, setRequiresV2Fallback] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaVersion, setCaptchaVersion] = useState<'v3' | 'v2' | null>(null);
    const hasAttemptedRef = useRef(false);

    const verifyV3 = useCallback(async () => {
        if (!executeRecaptcha) return;

        setIsLoading(true);
        try {
            const token = await executeRecaptcha('booking_form');

            // Verify the token server-side to get the score
            const response = await fetch('/api/recaptcha/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, version: 'v3' }),
            });

            const data = await response.json();

            if (data.success && data.score >= SCORE_THRESHOLD) {
                setV3Verified(true);
                setRequiresV2Fallback(false);
                setCaptchaToken(token);
                setCaptchaVersion('v3');
            } else {
                setV3Verified(false);
                setRequiresV2Fallback(true);
            }
        } catch (error) {
            console.error('reCAPTCHA v3 verification failed:', error);
            setV3Verified(false);
            setRequiresV2Fallback(true);
        } finally {
            setIsLoading(false);
        }
    }, [executeRecaptcha]);

    // Run v3 verification in the background once the script loads
    useEffect(() => {
        if (executeRecaptcha && !hasAttemptedRef.current) {
            hasAttemptedRef.current = true;
            verifyV3();
        }
    }, [executeRecaptcha, verifyV3]);

    const onV2Verify = useCallback((token: string) => {
        setV2Verified(true);
        setCaptchaToken(token);
        setCaptchaVersion('v2');
        setRequiresV2Fallback(false);
    }, []);

    const isVerified = v3Verified || v2Verified;

    return {
        v3Verified,
        v2Verified,
        isVerified,
        requiresV2Fallback,
        isLoading,
        captchaToken,
        captchaVersion,
        onV2Verify,
        retryV3: verifyV3,
    };
}
