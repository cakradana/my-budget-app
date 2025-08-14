import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
    expect(button.textContent).toBe("Click me");
  });

  it("should apply variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);

    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.className).toContain("destructive");
  });

  it("should apply size classes", () => {
    const { container } = render(<Button size="lg">Large Button</Button>);

    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.className).toContain("h-10");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDefined();
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/test");
  });

  it("should handle different variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const;

    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Test</Button>);
      const button = container.querySelector("button");
      expect(button).toBeDefined();
    });
  });

  it("should handle different sizes", () => {
    const sizes = ["default", "sm", "lg", "icon"] as const;

    sizes.forEach(size => {
      const { container } = render(<Button size={size}>Test</Button>);
      const button = container.querySelector("button");
      expect(button).toBeDefined();
    });
  });
});
