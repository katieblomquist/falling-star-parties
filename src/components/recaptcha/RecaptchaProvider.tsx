'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? '';

export default function RecaptchaProvider({ children }: { children: React.ReactNode }) {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_SITE_KEY}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: 'head',
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
