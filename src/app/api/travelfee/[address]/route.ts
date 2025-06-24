import { NextRequest, NextResponse } from "next/server";

type LatLng = {
    lat: number,
    lng: number
}

type Place = {
    formatted_address: string,
    location: LatLng
}

type Toll = {
    currencyCode: string,
    units: string
}


type Route = {
    distanceMeters: number,
    estimatedTolls: Array<Toll>
}

const key = process.env.GOOGLE_KEY;
const katieLat = process.env.KATIE_LAT!;
const katieLong = process.env.KATIE_LONG!;
if (katieLat == null || katieLong == null) {
    throw new Error('Missing owner lat or long');
}
const owner: LatLng = { lat: parseFloat(katieLat), lng: parseFloat(katieLong) };

const METERS_IN_MILE = 1609.344;

export async function GET(
    _: NextRequest,
    { params }: { params: { address: string } }
) {
    const clientAddress: Place = await getClientAddress(params.address);
    const routeThere: Route = await getRoute(owner, clientAddress.location);
    let fee: Number;

    //When altered for broader use, this will need to be revisited to calculate tolls both directions every time. 

    if (routeThere.estimatedTolls != null) {
        const routeBack = await getRoute(clientAddress.location, owner);
        fee = calculateFee(routeThere, routeBack);

    } else {
        fee = calculateFee(routeThere);
    }

    return NextResponse.json(fee);
}


async function getClientAddress(address: string): Promise<Place> {
    if (key == null) {
        throw new Error('Missing Google API Key')
    }
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${address}&inputtype=textquery&fields=formatted_address%2Cgeometry&key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const addressFormatted = await res.json();
    return { formatted_address: addressFormatted.candidates[0].formatted_address, location: addressFormatted.candidates[0].geometry.location };
}

async function getRoute(start: LatLng, end: LatLng): Promise<Route> {
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": start.lat,
                        "longitude": start.lng
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": end.lat,
                        "longitude": end.lng
                    }
                }
            },
            "travelMode": "DRIVE",
            "extraComputations": ["TOLLS"],
            "routeModifiers": {
                "vehicleInfo": {
                    "emissionType": "GASOLINE"
                }
            }
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': `${key}`,
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.travelAdvisory.tollInfo'
        }
    });

    const route = await res.json();
    return { distanceMeters: route.routes[0].distanceMeters, estimatedTolls: route.routes[0].travelAdvisory.tollInfo.estimatedPrice };

}

export function calculateFee(routeThere: Route, routeBack?: Route): number {
    const miles = routeThere.distanceMeters / METERS_IN_MILE;

    let fee = 0;

    if (miles > 30) {
        fee += miles - 30;
    }

    if (miles > 50) {
        fee += miles - 50;
    }

    fee = routeThere.estimatedTolls.reduce((acc, next) => {
        return acc + parseFloat(next.units);
    }, fee);

    fee = routeBack?.estimatedTolls.reduce((acc, next) => {
        return acc + parseFloat(next.units);
    }, fee) ?? fee;

    return Math.ceil(fee);
}