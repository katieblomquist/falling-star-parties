/**
 * @jest-environment node
 *
 * route.test.ts — Tests for GET /api/travelfee
 *
 * Mocks global.fetch to simulate Google Routes API responses.
 */

jest.mock("next/server", () => {
  class MockNextRequest {
    readonly url: string;
    constructor(url: string) {
      this.url = url;
    }
  }

  class MockNextResponse {
    readonly status: number;
    private _body: unknown;

    constructor(body: unknown, init: { status?: number } = {}) {
      this._body = body;
      this.status = init.status ?? 200;
    }

    async json() {
      return this._body;
    }

    static json(body: unknown, init: { status?: number } = {}) {
      return new MockNextResponse(body, init);
    }
  }

  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

import { NextRequest } from "next/server";
import { GET } from "../route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return new NextRequest(`http://localhost/api/travelfee?${qs}`);
}

function makeRoutesApiResponse(distanceMeters: number, tolls: Array<{ units: string }> = []) {
  return {
    ok: true,
    json: async () => ({
      routes: [
        {
          distanceMeters,
          travelAdvisory: {
            tollInfo: {
              estimatedPrice: tolls,
            },
          },
        },
      ],
    }),
  };
}

const METERS_IN_MILE = 1609.344;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.GOOGLE_KEY = "test-google-key";
  process.env.KATIE_LAT = "39.3753531";
  process.env.KATIE_LONG = "-76.38685699999999";
  jest.clearAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/travelfee", () => {
  describe("parameter validation", () => {
    it("returns 400 when lat is missing", async () => {
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lng: "-77.0" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is missing", async () => {
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lat: "38.9" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when lat is not a number", async () => {
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lat: "abc", lng: "-77.0" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when lng is not a number", async () => {
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lat: "38.9", lng: "notanumber" }));
      expect(res.status).toBe(400);
    });
  });

  describe("environment variable validation", () => {
    it("returns 500 when GOOGLE_KEY is missing", async () => {
      delete process.env.GOOGLE_KEY;
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      expect(res.status).toBe(500);
    });

    it("returns 500 when KATIE_LAT is missing", async () => {
      delete process.env.KATIE_LAT;
      global.fetch = jest.fn();
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      expect(res.status).toBe(500);
    });
  });

  describe("fee calculation — no tolls", () => {
    it("returns fee: 0 when distance is under 30 miles", async () => {
      const meters = 20 * METERS_IN_MILE; // 20 miles
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.fee).toBe(0);
    });

    it("returns fee: 0 at exactly 30 miles", async () => {
      const meters = 30 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      expect(json.fee).toBe(0);
    });

    it("charges $1/mile for miles 30–50 (40-mile trip = $10)", async () => {
      const meters = 40 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      // 40 - 30 = 10 miles over 30, at $1/mile
      expect(json.fee).toBe(10);
    });

    it("charges $2/mile for miles over 50 (60-mile trip = $30)", async () => {
      const meters = 60 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      // (50-30)*1 + (60-50)*2 = 20 + 20 = 40... wait let me recalc
      // fee += miles - 30 = 30; fee += miles - 50 = 10; total = 40
      expect(json.fee).toBe(40);
    });

    it("returns miles in response", async () => {
      const meters = 25 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      expect(json.miles).toBeCloseTo(25, 0);
    });

    it("returns tolls: false when no tolls", async () => {
      const meters = 25 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      expect(json.tolls).toBe(false);
    });
  });

  describe("fee calculation — with tolls", () => {
    it("adds toll costs to the fee", async () => {
      const meters = 20 * METERS_IN_MILE; // under 30 miles, so base fee = 0
      // toll there = $5
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(
          makeRoutesApiResponse(meters, [{ units: "5" }])
        )
        // toll back = $3
        .mockResolvedValueOnce(
          makeRoutesApiResponse(meters, [{ units: "3" }])
        );
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      // 0 base + 5 toll there + 3 toll back = 8 → ceil = 8
      expect(json.fee).toBe(8);
    });

    it("returns tolls: true when tolls are present", async () => {
      const meters = 20 * METERS_IN_MILE;
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(makeRoutesApiResponse(meters, [{ units: "5" }]))
        .mockResolvedValueOnce(makeRoutesApiResponse(meters, [{ units: "3" }]));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      expect(json.tolls).toBe(true);
    });

    it("floors the final fee", async () => {
      // 31.5 miles → fee = 1.5 → floor = 1
      const meters = 31.5 * METERS_IN_MILE;
      global.fetch = jest.fn().mockResolvedValue(makeRoutesApiResponse(meters));
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      const json = await res.json();
      expect(json.fee).toBe(1);
    });
  });

  describe("Google Routes API errors", () => {
    it("returns 500 when Routes API returns non-ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "API key invalid",
      });
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      expect(res.status).toBe(500);
    });

    it("returns 500 when Routes API returns no routes", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ routes: [] }),
      });
      const res = await GET(makeRequest({ lat: "38.9", lng: "-77.0" }));
      expect(res.status).toBe(500);
    });
  });
});
