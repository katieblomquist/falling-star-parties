/**
 * BookClient.test.tsx
 *
 * Integration tests for the form submission flow in BookClient.
 * All heavy child components (Stepper, NavBar, Footer, etc.) are mocked so
 * the tests focus purely on submit logic, reCAPTCHA handling, fetch, and
 * the resulting UI states (loading, thank-you, error, retry).
 */

/* eslint-disable react/display-name */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DateTime } from "luxon";

// ---------------------------------------------------------------------------
// Module-level mocks (must be before any imports that touch these modules)
// ---------------------------------------------------------------------------

// Mock next/font (already handled by moduleNameMapper in jest.config.ts)
// Mock child UI components that have heavy dependencies
jest.mock("@/components/navbar/navbar", () => () => <div data-testid="navbar" />);
jest.mock("@/components/footer/footer", () => () => <div data-testid="footer" />);
jest.mock("@/components/swoop/swoop", () => () => <div data-testid="swoop" />);

// Mock all booking form step components — we don't test their internals here
jest.mock("@/components/bookingForm/Information/information", () => () => (
  <div data-testid="step-information" />
));
jest.mock("@/components/bookingForm/TimeLocation/timeLocation", () => () => (
  <div data-testid="step-timelocation" />
));
jest.mock("@/components/bookingForm/EventOptions/eventOptions", () => () => (
  <div data-testid="step-eventoptions" />
));
jest.mock("@/components/bookingForm/Characters/characters", () => () => (
  <div data-testid="step-characters" />
));
jest.mock("@/components/bookingForm/EventDetails/eventDetails", () => () => (
  <div data-testid="step-eventdetails" />
));
jest.mock("@/components/bookingForm/ReviewRequest/reviewRequest", () => () => (
  <div data-testid="step-reviewrequest" />
));

// Mock the Stepper: render a simple "Submit" button that calls the submit prop
jest.mock("@/components/form/Stepper/stepper", () => {
  return function MockStepper({
    submit,
    primaryFinalStepButton,
  }: {
    submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    primaryFinalStepButton: string;
    [key: string]: unknown;
  }) {
    return (
      <button
        data-testid="submit-button"
        onClick={() => submit()}
        type="button"
      >
        {primaryFinalStepButton}
      </button>
    );
  };
});

// Mock reCAPTCHA hook
const mockGetRecaptchaToken = jest.fn();
jest.mock("@/lib/useRecaptchaV3", () => ({
  useRecaptchaV3: () => mockGetRecaptchaToken,
}));

// Now import the component under test
import Book from "../BookClient";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const VALID_PAGE_ID = "notion-page-abc-123";

// Build a complete set of valid form values that react-hook-form defaultValues
// will be overridden with in tests via user interaction, BUT since the child
// step components are mocked, the form won't have user-entered values.
// We test the submit flow by directly triggering submit with the hook-form
// defaults that pass validation — so we patch the useForm mock to skip
// validation when needed.
//
// APPROACH: Rather than fighting react-hook-form internals, we mock
// `handleSubmit` to call the onValid callback immediately with fixture data,
// giving us full control over what reaches our submit function.

const FIXTURE_FORM_VALUES = {
  FirstName: "Jane",
  LastName: "Doe",
  Email: "jane@example.com",
  Phone: "555-123-4567",
  EventType: "Birthday Party",
  Date: DateTime.fromISO("2026-07-04"),
  Time: "2:00 PM",
  StreetAddress: "123 Main St",
  City: "Springfield",
  State: "VA",
  Zip: "22150",
  Package: 0,
  Extras: [],
  NumCharacters: "1",
  Character: [{ characterId: 1, dressId: 0 }],
  ChildName: "Lily",
  ChildAge: "5",
  OrganizationName: "",
  Attendance: "20",
  LocationPref: "Indoor",
  PhotoPref: "Yes",
  AdditionalInfo: "",
  AgreeToTOS: true,
};

// We mock react-hook-form's useForm so handleSubmit always calls onValid with
// our fixture data synchronously. This lets us test the async submit branch
// without fighting form validation.
jest.mock("react-hook-form", () => {
  const actual = jest.requireActual("react-hook-form") as typeof import("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit:
        (onValid: (data: unknown) => void) =>
        async () => {
          onValid(FIXTURE_FORM_VALUES);
        },
      control: {},
      resetField: jest.fn(),
      formState: { errors: {} },
    }),
    useWatch: () => [],
  };
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  // Default: reCAPTCHA returns a valid token
  mockGetRecaptchaToken.mockResolvedValue("valid-captcha-token");
  // Silence scrollTo (not available in jsdom)
  Object.defineProperty(window, "scrollTo", {
    value: jest.fn(),
    writable: true,
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderBook() {
  return render(<Book />);
}

function clickSubmit() {
  fireEvent.click(screen.getByTestId("submit-button"));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BookClient — form submission flow", () => {
  describe("happy path", () => {
    it("calls fetch with POST to /api/createEvent", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pageId: VALID_PAGE_ID, emailSent: true }),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "/api/createEvent",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("sends captchaToken and captchaVersion in the request body", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pageId: VALID_PAGE_ID, emailSent: true }),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        const [, options] = (fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.captchaToken).toBe("valid-captcha-token");
        expect(body.captchaVersion).toBe("v3");
      });
    });

    it("renders the ThankYou screen after a successful submission", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pageId: VALID_PAGE_ID, emailSent: true }),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        // ThankYou component renders "Thank You" text with the first name
        expect(screen.getByText(/thank you/i)).toBeInTheDocument();
      });
    });

    it("does not show an error after a successful submission", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pageId: VALID_PAGE_ID, emailSent: true }),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => screen.getByText(/thank you/i));
      expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows the loading spinner while fetch is in-flight", async () => {
      // Never resolve so we can inspect the intermediate state
      let resolveFetch!: (v: unknown) => void;
      global.fetch = jest.fn(
        () => new Promise((res) => { resolveFetch = res; })
      ) as jest.Mock;

      renderBook();

      act(() => {
        clickSubmit();
      });

      await waitFor(() => {
        expect(screen.getByText(/sending your request/i)).toBeInTheDocument();
      });

      // Clean up — resolve to avoid act() warnings
      act(() => {
        resolveFetch({
          ok: true,
          json: async () => ({ pageId: VALID_PAGE_ID }),
        });
      });
    });
  });

  describe("reCAPTCHA failures", () => {
    it("shows error and does NOT call fetch when token is null", async () => {
      mockGetRecaptchaToken.mockResolvedValue(null);
      global.fetch = jest.fn() as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(/captcha verification failed/i)
        ).toBeInTheDocument();
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("shows error and does NOT call fetch when reCAPTCHA throws", async () => {
      mockGetRecaptchaToken.mockRejectedValue(new Error("reCAPTCHA unavailable"));
      global.fetch = jest.fn() as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(/captcha failed to load/i)
        ).toBeInTheDocument();
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("renders the retry button after reCAPTCHA failure", async () => {
      mockGetRecaptchaToken.mockResolvedValue(null);
      global.fetch = jest.fn() as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });
    });
  });

  describe("network / server errors", () => {
    it("shows a generic error when fetch rejects (network down)", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Network error")) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(/there was an error submitting your request/i)
        ).toBeInTheDocument();
      });
    });

    it("shows the server's error message when the API returns 4xx", async () => {
      const serverError = "Booking window is full. Please choose another date.";
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: serverError }),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(screen.getByText(serverError)).toBeInTheDocument();
      });
    });

    it("shows a fallback error message when the API 4xx body has no error field", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(/there was an error submitting your request/i)
        ).toBeInTheDocument();
      });
    });

    it("renders the Try Again button after a server error", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error("500")) as jest.Mock;

      renderBook();
      clickSubmit();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      });
    });
  });

  describe("retry behaviour", () => {
    it("clears the error state and shows the form again after clicking retry", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Network error")) as jest.Mock;

      renderBook();
      clickSubmit();

      // Wait for error state
      await waitFor(() => screen.getByRole("button", { name: /try again/i }));

      // Reset fetch to succeed on the next attempt
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ pageId: VALID_PAGE_ID }),
      });

      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      // After retry the error panel should be gone and the form (stepper) should
      // be visible again
      await waitFor(() => {
        expect(
          screen.queryByText(/there was an error/i)
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("submit-button")).toBeInTheDocument();
      });
    });
  });
});
