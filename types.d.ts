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