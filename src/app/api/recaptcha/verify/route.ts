import { NextRequest, NextResponse } from 'next/server';

const RECAPTCHA_V3_SECRET = process.env.RECAPTCHA_V3_SECRET_KEY ?? '';
const RECAPTCHA_V2_SECRET = process.env.RECAPTCHA_V2_SECRET_KEY ?? '';

export async function POST(request: NextRequest) {
    try {
        const { token, version } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Missing captcha token' },
                { status: 400 }
            );
        }

        const secretKey = version === 'v2' ? RECAPTCHA_V2_SECRET : RECAPTCHA_V3_SECRET;

        if (!secretKey) {
            console.error(`Missing RECAPTCHA_${version?.toUpperCase()}_SECRET_KEY env variable`);
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        const data = await response.json();

        return NextResponse.json({
            success: data.success,
            score: data.score ?? null,
            action: data.action ?? null,
        });
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
