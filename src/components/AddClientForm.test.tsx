import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddClientForm } from "./AddClientForm";

function mockFetchResponse(body: unknown, status: number) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe("AddClientForm", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("shows required field validation on submit", async () => {
    const user = userEvent.setup();

    render(<AddClientForm />);

    await user.click(screen.getByRole("button", { name: /create client/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required")).toBeInTheDocument();
    expect(screen.getByText("Minimum budget is required")).toBeInTheDocument();
    expect(screen.getByText("Maximum budget is required")).toBeInTheDocument();
  });

  it("submits successfully and resets the form", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    (global.fetch as jest.Mock).mockImplementation(() =>
      mockFetchResponse({ id: "client-123" }, 201),
    );

    render(<AddClientForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/^email$/i), "jordan.lee@example.com");
    await user.type(screen.getByLabelText(/^phone$/i), "619-555-0142");
    await user.type(screen.getByLabelText(/minimum budget/i), "450000");
    await user.type(screen.getByLabelText(/maximum budget/i), "650000");
    await user.type(
      screen.getByLabelText(/search criteria/i),
      "3 bed, 2 bath near North Park",
    );

    await user.click(screen.getByRole("button", { name: /create client/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("client-123");
    });

    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("");
    expect(global.fetch).toHaveBeenCalledWith("/api/clients", expect.objectContaining({
      method: "POST",
    }));
  });

  it("shows an API error message when submission fails", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockImplementation(() =>
      mockFetchResponse({ error: "Email already registered" }, 400),
    );

    render(<AddClientForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/^email$/i), "jordan.lee@example.com");
    await user.type(screen.getByLabelText(/^phone$/i), "619-555-0142");
    await user.type(screen.getByLabelText(/minimum budget/i), "450000");
    await user.type(screen.getByLabelText(/maximum budget/i), "650000");

    await user.click(screen.getByRole("button", { name: /create client/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already registered",
    );
  });
});
