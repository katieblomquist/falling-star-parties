type LatLngLiteral = {
    lat: number,
    lng: number
}

type Place = {
    formatted_address: string,
    location: LatLngLiteral
}

type Toll = {
    currencyCode: string,
    units: string
}


type Route = {
    distanceMeters: number,
    estimatedTolls: Array<Toll>
}