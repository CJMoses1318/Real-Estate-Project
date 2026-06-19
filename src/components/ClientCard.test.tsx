import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientCard } from "./ClientCard";
import type { Client } from "@/lib/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 5, 18, 12, 0, 0);

const baseClient: Client = {
  id: "client-1",
  ownerId: "user-1",
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  phone: "619-555-0142",
  propertyType: "buyer",
  budgetMin: 450000,
  budgetMax: 650000,
  searchCriteria: "3 bed, 2 bath near North Park",
  stage: "inquiry",
  latestNote: "Prefers move-in ready homes with a yard.",
  lastActivityAt: now - 2 * MS_PER_DAY,
  createdAt: now - 10 * MS_PER_DAY,
};

describe("ClientCard", () => {
  it("renders the correct client name", () => {
    render(<ClientCard client={baseClient} now={now} />);

    expect(
      screen.getByRole("button", { name: /open client record for jordan lee/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText(/Prefers move-in ready homes with a yard./)).toBeInTheDocument();
  });

  it("shows amber urgency indicator when last activity was 6 days ago", () => {
    render(
      <ClientCard
        client={{
          ...baseClient,
          lastActivityAt: now - 6 * MS_PER_DAY,
        }}
        now={now}
      />,
    );

    expect(screen.getByTestId("urgency-indicator")).toHaveTextContent(
      "Follow up soon",
    );
  });

  it("shows red urgency indicator when last activity was 11 days ago", () => {
    render(
      <ClientCard
        client={{
          ...baseClient,
          lastActivityAt: now - 11 * MS_PER_DAY,
        }}
        now={now}
      />,
    );

    expect(screen.getByTestId("urgency-indicator")).toHaveTextContent(
      "Urgent: no recent activity",
    );
  });

  it("calls the onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<ClientCard client={baseClient} now={now} onClick={handleClick} />);

    await user.click(
      screen.getByRole("button", { name: /open client record for jordan lee/i }),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith("client-1");
  });
});
