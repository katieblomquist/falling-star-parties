type LatLngLiteral = {
    lat: number,
    lng: number
}

type Bounds = {
    northeast: LatLngLiteral,
    southwest: LatLngLiteral
}

type Geometry = {
    location: LatLngLiteral,
    viewport: Bounds
}

type Place = {
    formatted_address: string,
    geometry: Geometry
}

type Toll = {
    currencyCode: string,
    units: string
}


type Route = {
    distanceMeters: number,
    estimatedTolls: Array<Toll>
}