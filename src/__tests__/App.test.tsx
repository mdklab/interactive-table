import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App shell", () => {
  it("renders the hero headline and feature list", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /data at a glance/i })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
