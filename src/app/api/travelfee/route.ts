import { NextRequest, NextResponse } from "next/server";

type LatLng = {
    lat: number;
    lng: number;
};

type Toll = {
    currencyCode: string;
    units: string;
    nanos?: number;
};

type Route = {
    distanceMeters: number;
    estimatedTolls: Toll[];
};

const METERS_IN_MILE = 1609.344;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const captchaToken = searchParams.get("captchaToken");

    if (!captchaToken) {
        return NextResponse.json(
            { error: "Missing captcha token" },
            { status: 400 }
        );
    }

    const recaptchaSecret = process.env.RECAPTCHA_V3_SECRET_KEY;
    if (!recaptchaSecret) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const recaptchaRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" }
    );
    if (!recaptchaRes.ok) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    const recaptchaData = await recaptchaRes.json();
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return NextResponse.json({ error: "CAPTCHA verification failed." }, { status: 403 });
    }

    if (!latParam || !lngParam) {
        return NextResponse.json(
            { error: "Missing required query parameters: lat, lng" },
            { status: 400 }
        );
    }

    const clientLat = parseFloat(latParam);
    const clientLng = parseFloat(lngParam);

    if (isNaN(clientLat) || isNaN(clientLng)) {
        return NextResponse.json(
            { error: "Invalid lat/lng values" },
            { status: 400 }
        );
    }

    const key = process.env.GOOGLE_KEY;
    if (!key) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }

    const katieLat = parseFloat(process.env.KATIE_LAT ?? "");
    const katieLng = parseFloat(process.env.KATIE_LONG ?? "");
    if (isNaN(katieLat) || isNaN(katieLng)) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }

    const owner: LatLng = { lat: katieLat, lng: katieLng };
    const client: LatLng = { lat: clientLat, lng: clientLng };

    try {
        const routeThere = await getRoute(owner, client, key);
        const miles = routeThere.distanceMeters / METERS_IN_MILE;

        let fee = 0;
        if (miles > 30) {
            fee += miles - 30;
        }
        if (miles > 50) {
            fee += miles - 50;
        }

        // Add tolls from the outbound leg
        fee = routeThere.estimatedTolls.reduce((acc, toll) => {
            return acc + Math.ceil(parseFloat(toll.units) + (toll.nanos ?? 0) / 1_000_000_000);
        }, fee);

        // If there are tolls going there, also fetch the return trip and add its tolls
        if (routeThere.estimatedTolls.length > 0) {
            const routeBack = await getRoute(client, owner, key);
            fee = routeBack.estimatedTolls.reduce((acc, toll) => {
                return acc + Math.ceil(parseFloat(toll.units) + (toll.nanos ?? 0) / 1_000_000_000);
            }, fee);
        }

        const finalFee = Math.floor(fee);

        return NextResponse.json({
            fee: finalFee,
            miles: Math.round(miles * 10) / 10,
            tolls: routeThere.estimatedTolls.length > 0,
        });
    } catch (err) {
        console.error("Travel fee calculation error:", err);
        return NextResponse.json(
            { error: "Failed to calculate travel fee" },
            { status: 500 }
        );
    }
}

async function getRoute(start: LatLng, end: LatLng, key: string): Promise<Route> {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            origin: {
                location: {
                    latLng: {
                        latitude: start.lat,
                        longitude: start.lng,
                    },
                },
            },
            destination: {
                location: {
                    latLng: {
                        latitude: end.lat,
                        longitude: end.lng,
                    },
                },
            },
            travelMode: "DRIVE",
            extraComputations: ["TOLLS"],
            routeModifiers: {
                vehicleInfo: {
                    emissionType: "GASOLINE",
                },
            },
        }),
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.travelAdvisory.tollInfo",
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Google Routes API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
        throw new Error("No routes returned from Google Routes API");
    }

    const estimatedTolls: Toll[] =
        route.travelAdvisory?.tollInfo?.estimatedPrice ?? [];

    return {
        distanceMeters: route.distanceMeters,
        estimatedTolls,
    };
}
