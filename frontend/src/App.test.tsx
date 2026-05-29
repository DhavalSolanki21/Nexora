import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import NexoraLogo from "./components/NexoraLogo";

test("renders the Nexora logo", () => {
  render(<NexoraLogo />);

  expect(screen.getByRole("img", { name: /nexora logo/i })).toBeTruthy();
});
