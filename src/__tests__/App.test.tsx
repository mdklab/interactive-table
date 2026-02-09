import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App shell", () => {
  it("renders the hero headline and upload controls", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Bring your CSV/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose a file/i)).toBeInTheDocument();
  });
});
