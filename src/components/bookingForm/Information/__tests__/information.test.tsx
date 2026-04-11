/**
 * information.test.tsx
 *
 * Tests for the Information step component:
 * - Required field validation (first name, last name, email, phone, event type)
 * - Whitespace-only name rejection
 * - Email pattern validation
 * - Phone pattern validation
 * - Event type selection triggers resetField for dependent fields
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useForm } from "react-hook-form";
import Information from "../information";
import type { FormValues } from "@/app/book/BookClient";

// ---------------------------------------------------------------------------
// Tabler icons stub — avoids SVG/canvas issues in jsdom
// ---------------------------------------------------------------------------
jest.mock("@tabler/icons-react", () => ({
  IconChevronDown: () => <span>▼</span>,
  IconChevronUp: () => <span>▲</span>,
}));

// ---------------------------------------------------------------------------
// Wrapper that provides a real useForm instance
// ---------------------------------------------------------------------------
type WrapperProps = {
  onResetField?: jest.Mock;
};

function InformationWrapper({ onResetField = jest.fn() }: WrapperProps = {}) {
  const {
    control,
    resetField,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      FirstName: "",
      LastName: "",
      Email: "",
      Phone: "",
      EventType: "",
    },
  });

  // Expose trigger so tests can manually fire validation
  (window as any).__trigger = trigger;

  const wrappedResetField = (...args: Parameters<typeof resetField>) => {
    onResetField(...args);
    resetField(...args);
  };

  return (
    <Information
      control={control}
      resetField={wrappedResetField as any}
      errors={errors}
    />
  );
}

function renderInformation(props: WrapperProps = {}) {
  return render(<InformationWrapper {...props} />);
}

async function triggerValidation() {
  await (window as any).__trigger();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Information step — field validation", () => {
  describe("First Name", () => {
    it("shows a required error when left empty and validation fires", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("First name is required.")).toBeInTheDocument();
      });
    });

    it("shows an error for a whitespace-only first name", async () => {
      renderInformation();
      const input = screen.getByPlaceholderText("First Name");
      fireEvent.change(input, { target: { value: "   " } });
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("First name is required.")).toBeInTheDocument();
      });
    });

    it("clears the error when a valid first name is entered", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() =>
        screen.getByText("First name is required.")
      );

      fireEvent.change(screen.getByPlaceholderText("First Name"), {
        target: { value: "Jane" },
      });
      await waitFor(() => {
        expect(
          screen.queryByText("First name is required.")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Last Name", () => {
    it("shows a required error when left empty", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("Last name is required.")).toBeInTheDocument();
      });
    });

    it("shows an error for a whitespace-only last name", async () => {
      renderInformation();
      fireEvent.change(screen.getByPlaceholderText("Last Name"), {
        target: { value: "  " },
      });
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("Last name is required.")).toBeInTheDocument();
      });
    });

    it("clears the error when a valid last name is entered", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => screen.getByText("Last name is required."));

      fireEvent.change(screen.getByPlaceholderText("Last Name"), {
        target: { value: "Doe" },
      });
      await waitFor(() => {
        expect(
          screen.queryByText("Last name is required.")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Email", () => {
    it("shows a required error when left empty", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("Email is required.")).toBeInTheDocument();
      });
    });

    it.each([
      ["no-at-sign", "no-at-sign"],
      ["missing domain", "user@"],
      ["missing local part", "@domain.com"],
      ["spaces in email", "user name@domain.com"],
    ])("shows a pattern error for invalid email: %s", async (_label, value) => {
      renderInformation();
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value },
      });
      await waitFor(() => {
        expect(
          screen.getByText("Enter a valid email address.")
        ).toBeInTheDocument();
      });
    });

    it.each([
      "jane@example.com",
      "user+tag@sub.domain.org",
      "a@b.co",
    ])("accepts valid email: %s", async (email) => {
      renderInformation();
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: email },
      });
      await waitFor(() => {
        expect(
          screen.queryByText("Enter a valid email address.")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Phone", () => {
    it("shows a required error when left empty", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => {
        expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
      });
    });

    it.each([
      ["too short", "123"],
      ["letters", "abcdefg"],
    ])("shows a pattern error for invalid phone: %s", async (_label, value) => {
      renderInformation();
      fireEvent.change(screen.getByPlaceholderText("Phone"), {
        target: { value },
      });
      await waitFor(() => {
        expect(
          screen.getByText("Enter a valid phone number.")
        ).toBeInTheDocument();
      });
    });

    it.each([
      "555-123-4567",
      "(555) 123-4567",
      "+1 555 123 4567",
      "5551234567",
    ])("accepts valid phone: %s", async (phone) => {
      renderInformation();
      fireEvent.change(screen.getByPlaceholderText("Phone"), {
        target: { value: phone },
      });
      await waitFor(() => {
        expect(
          screen.queryByText("Enter a valid phone number.")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Event Type", () => {
    it("shows a required error when no event type is selected", async () => {
      renderInformation();
      await triggerValidation();
      await waitFor(() => {
        expect(
          screen.getByText("Event type is required.")
        ).toBeInTheDocument();
      });
    });

    it("calls resetField for dependent fields when event type changes", async () => {
      const onResetField = jest.fn();
      const { container } = renderInformation({ onResetField });

      // The Dropdown renders a div#nick-test > div[tabIndex=0] as the toggle
      const toggleDiv = container.querySelector(
        "#nick-test [tabindex='0']"
      ) as HTMLElement;
      expect(toggleDiv).not.toBeNull();
      fireEvent.click(toggleDiv);

      // The options list is now visible — click "Birthday Party"
      await waitFor(() => {
        expect(screen.getByText("Birthday Party")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("Birthday Party"));

      expect(onResetField).toHaveBeenCalledWith("ChildAge");
      expect(onResetField).toHaveBeenCalledWith("ChildName");
      expect(onResetField).toHaveBeenCalledWith("Extras");
      expect(onResetField).toHaveBeenCalledWith("OrganizationName");
      expect(onResetField).toHaveBeenCalledWith("Package");
    });
  });
});
