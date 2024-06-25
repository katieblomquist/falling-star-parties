import { calculateFee } from "./route";

const mockRouteThereUnderFifty: Route = {
    distanceMeters: 67592.4,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "0"
    }]
}

const mockRouteThereUnderFiftyToll: Route = {
    distanceMeters: 67592.4,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "3"
    }]
}

const mockRouteThereUnderThirty: Route = {
    distanceMeters: 40233.6,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "0"
    }]
}

const mockRouteThereUnderThirtyToll: Route = {
    distanceMeters: 40233.6,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "6"
    }]
}

const mockRouteThereOverFifty: Route = {
    distanceMeters: 96560.6,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "0"
    }]
}

const mockRouteThereOverFiftyToll: Route = {
    distanceMeters: 96560.6,
    estimatedTolls: [{
        currencyCode: "USD",
        units: "3"
    }]
}

describe("calculate fee", () => {

    it("calculates below 30", () => {
        expect(calculateFee(mockRouteThereUnderThirty)).toBe(0);
        expect(calculateFee(mockRouteThereUnderThirtyToll)).toBe(6);
        expect(calculateFee(mockRouteThereUnderThirtyToll, mockRouteThereUnderThirty)).toBe(6);
        expect(calculateFee(mockRouteThereUnderThirtyToll, mockRouteThereUnderThirtyToll)).toBe(12);
        
    });

    it("calculates between 30 and 50", () => {
        expect(calculateFee(mockRouteThereUnderFifty)).toBe(12);
        expect(calculateFee(mockRouteThereUnderFiftyToll)).toBe(15);
        expect(calculateFee(mockRouteThereUnderFiftyToll, mockRouteThereUnderFifty)).toBe(15);
        expect(calculateFee(mockRouteThereUnderFiftyToll, mockRouteThereUnderFiftyToll)).toBe(18);
    });

    it("calculates above 50", () => {
        expect(calculateFee(mockRouteThereOverFifty)).toBe(40);
        expect(calculateFee(mockRouteThereOverFiftyToll)).toBe(43);
        expect(calculateFee(mockRouteThereOverFiftyToll, mockRouteThereOverFifty)).toBe(43);
        expect(calculateFee(mockRouteThereOverFiftyToll, mockRouteThereOverFiftyToll)).toBe(46);
    });
    
});