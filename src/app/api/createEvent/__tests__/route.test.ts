/**
 * @jest-environment node
 *
 * route.test.ts — Tests for POST /api/createEvent
 *
 * Dependencies mocked:
 *   - next/server        → NextRequest / NextResponse (lightweight Node-compatible stubs)
 *   - @notionhq/client   → pages.create
 *   - @/lib/emailService → emailService.sendEmail
 *   - @/lib/logger       → silenced (no console noise in test output)
 *
 * The handler reads NOTION_KEY and NOTION_DATABASE_ID from process.env at
 * runtime, so we set those in beforeEach and clean up in afterEach.
 */

// ---------------------------------------------------------------------------
// next/server stub — must come before any import of next/server
// ---------------------------------------------------------------------------

jest.mock("next/server", () => {
  class MockNextRequest {
    private _body: string;
    constructor(_url: string, init: { body?: string; [k: string]: unknown } = {}) {
      this._body = typeof init.body === "string" ? init.body : "";
    }
    async json() {
      return JSON.parse(this._body);
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

// ---------------------------------------------------------------------------
// Type import for helpers only — runtime is provided by the mock above
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const mockPagesCreate = jest.fn();

jest.mock("@notionhq/client", () => ({
  Client: jest.fn().mockImplementation(() => ({
    pages: {
      create: mockPagesCreate,
    },
  })),
}));

const mockSendEmail = jest.fn();
jest.mock("@/lib/emailService", () => ({
  emailService: { sendEmail: mockSendEmail },
}));

// Silence logger output in tests
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    generateRequestId: () => "req_test_id",
    withContext: () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      time: async (_op: string, fn: () => Promise<unknown>) => fn(),
    }),
    time: async (_op: string, fn: () => Promise<unknown>) => fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import handler AFTER mocks are in place
// ---------------------------------------------------------------------------
import { POST, GET } from "../route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_PAGE_ID = "notion-page-abc-123";

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/createEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  dateTime: "2026-07-04T14:00:00.000-04:00",
  address: "123 Main St, Springfield, VA 22150",
  packageId: 0,
  characterSelections: [{ characterId: 1, dressId: 0 }],
  extrasIds: [],
  eventType: "Birthday Party",
  childName: "Lily",
  childAge: 5,
  orgName: null,
  numChildren: 20,
  locationPref: "Indoor",
  photoPref: true,
  additionalInfo: null,
  agreeToTos: true,
  captchaToken: "valid-token",
  captchaVersion: "v3",
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = { ...process.env };

// Default fetch mock: reCAPTCHA siteverify returns success
const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockRecaptchaSuccess() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, score: 0.9 }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NOTION_KEY = "secret_test_key";
  process.env.NOTION_DATABASE_ID = "test-database-id";
  process.env.RECAPTCHA_V3_SECRET_KEY = "test-recaptcha-secret";
  // Default: Notion succeeds
  mockPagesCreate.mockResolvedValue({ id: VALID_PAGE_ID });
  // Default: email succeeds
  mockSendEmail.mockResolvedValue(undefined);
  // Default: reCAPTCHA succeeds
  mockRecaptchaSuccess();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/createEvent", () => {
  describe("missing environment variables", () => {
    it("returns 500 when NOTION_KEY is missing", async () => {
      delete process.env.NOTION_KEY;
      const res = await POST(buildRequest(VALID_BODY));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });

    it("returns 500 when NOTION_DATABASE_ID is missing", async () => {
      delete process.env.NOTION_DATABASE_ID;
      const res = await POST(buildRequest(VALID_BODY));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBeTruthy();
    });
  });

  describe("successful submission", () => {
    it("returns 201 with pageId and emailSent: true", async () => {
      const res = await POST(buildRequest(VALID_BODY));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.pageId).toBe(VALID_PAGE_ID);
      expect(json.emailSent).toBe(true);
    });

    it("calls notion.pages.create with the correct database_id", async () => {
      await POST(buildRequest(VALID_BODY));
      expect(mockPagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: { database_id: "test-database-id" },
        })
      );
    });

    it("sets Client name property in Notion", async () => {
      await POST(buildRequest(VALID_BODY));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Client name"]).toEqual({
        title: [{ text: { content: "Jane Doe" } }],
      });
    });

    it("sets Email property in Notion", async () => {
      await POST(buildRequest(VALID_BODY));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Email"]).toEqual({
        email: "jane@example.com",
      });
    });

    it("calls emailService.sendEmail", async () => {
      await POST(buildRequest(VALID_BODY));
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "info@fallingstarparties.com",
        })
      );
    });

    it("includes a message in the 201 response", async () => {
      const res = await POST(buildRequest(VALID_BODY));
      const json = await res.json();
      expect(json.message).toBeTruthy();
    });
  });

  describe("email failure (non-fatal)", () => {
    it("still returns 201 even when sendEmail throws", async () => {
      mockSendEmail.mockRejectedValue(new Error("SMTP timeout"));
      const res = await POST(buildRequest(VALID_BODY));
      expect(res.status).toBe(201);
    });

    it("sets emailSent: false when sendEmail throws", async () => {
      mockSendEmail.mockRejectedValue(new Error("SMTP timeout"));
      const res = await POST(buildRequest(VALID_BODY));
      const json = await res.json();
      expect(json.emailSent).toBe(false);
    });

    it("includes emailError in the response when sendEmail throws", async () => {
      mockSendEmail.mockRejectedValue(new Error("SMTP timeout"));
      const res = await POST(buildRequest(VALID_BODY));
      const json = await res.json();
      expect(json.emailError).toBeTruthy();
    });

    it("still creates the Notion page even when email fails", async () => {
      mockSendEmail.mockRejectedValue(new Error("SMTP timeout"));
      await POST(buildRequest(VALID_BODY));
      expect(mockPagesCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("Notion failure", () => {
    it("returns 500 when notion.pages.create throws", async () => {
      mockPagesCreate.mockRejectedValue(new Error("Notion API error"));
      const res = await POST(buildRequest(VALID_BODY));
      expect(res.status).toBe(500);
    });

    it("returns a safe error message (no internal details) in 500 response", async () => {
      mockPagesCreate.mockRejectedValue(new Error("Notion API error"));
      const res = await POST(buildRequest(VALID_BODY));
      const json = await res.json();
      expect(json.error).toBeTruthy();
      // Should not expose raw exception message to clients
      expect(json.error).not.toContain("Notion API error");
    });
  });

  describe("optional fields", () => {
    it("includes Child's Name when childName is provided", async () => {
      await POST(buildRequest({ ...VALID_BODY, childName: "Sofia" }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Child's Name"]).toEqual({
        rich_text: [{ text: { content: "Sofia" } }],
      });
    });

    it("omits Child's Name property when childName is null", async () => {
      await POST(buildRequest({ ...VALID_BODY, childName: null }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Child's Name"]).toBeUndefined();
    });

    it("includes Child's Age when childAge is a number", async () => {
      await POST(buildRequest({ ...VALID_BODY, childAge: 7 }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Child's Age"]).toEqual({ number: 7 });
    });

    it("omits Child's Age property when childAge is null", async () => {
      await POST(buildRequest({ ...VALID_BODY, childAge: null }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Child's Age"]).toBeUndefined();
    });

    it("includes Additional Comments when orgName and additionalInfo are both provided", async () => {
      await POST(
        buildRequest({
          ...VALID_BODY,
          orgName: "Springfield Library",
          additionalInfo: "Please bring glitter",
        })
      );
      const call = mockPagesCreate.mock.calls[0][0];
      const comments = call.properties["Additional Comments"]?.rich_text?.[0]?.text?.content ?? "";
      expect(comments).toContain("Springfield Library");
      expect(comments).toContain("Please bring glitter");
    });

    it("includes Photos Allowed as true when photoPref is true", async () => {
      await POST(buildRequest({ ...VALID_BODY, photoPref: true }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Photos Allowed"]).toEqual({ checkbox: true });
    });

    it("includes Photos Allowed as false when photoPref is false", async () => {
      await POST(buildRequest({ ...VALID_BODY, photoPref: false }));
      const call = mockPagesCreate.mock.calls[0][0];
      expect(call.properties["Photos Allowed"]).toEqual({ checkbox: false });
    });
  });
});

describe("reCAPTCHA server-side verification", () => {
  it("returns 400 when captchaToken is missing", async () => {
    const { captchaToken: _omit, ...bodyWithoutToken } = VALID_BODY;
    const res = await POST(buildRequest(bodyWithoutToken));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/captcha/i);
  });

  it("does NOT call Notion when captchaToken is missing", async () => {
    const { captchaToken: _omit, ...bodyWithoutToken } = VALID_BODY;
    await POST(buildRequest(bodyWithoutToken));
    expect(mockPagesCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when reCAPTCHA score is too low", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, score: 0.2 }),
    });
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/captcha/i);
  });

  it("returns 400 when reCAPTCHA success is false", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, score: 0.9 }),
    });
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(400);
  });

  it("returns 500 when RECAPTCHA_V3_SECRET_KEY is missing", async () => {
    delete process.env.RECAPTCHA_V3_SECRET_KEY;
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });

  it("proceeds to create Notion entry when reCAPTCHA passes", async () => {
    // mockFetch already returns success from beforeEach
    const res = await POST(buildRequest(VALID_BODY));
    expect(res.status).toBe(201);
    expect(mockPagesCreate).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

describe("GET /api/createEvent", () => {
  it("returns 200 with endpoint info", async () => {
    const req = new NextRequest("http://localhost/api/createEvent", {
      method: "GET",
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.method).toBe("POST");
  });
});
