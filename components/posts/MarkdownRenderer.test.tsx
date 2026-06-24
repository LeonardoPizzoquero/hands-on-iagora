import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownRenderer } from "./MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("neutraliza <script> embutido", () => {
    const { container } = render(
      <MarkdownRenderer content={'oi <script>alert(1)</script> tchau'} />,
    );
    expect(container.querySelector("script")).toBeNull();
  });

  it("remove link javascript:", () => {
    const { container } = render(
      <MarkdownRenderer content={"[x](javascript:alert(1))"} />,
    );
    const a = container.querySelector("a");
    // href perigoso é removido pelo sanitizer (vira undefined/ausente)
    expect(a?.getAttribute("href") ?? "").not.toContain("javascript:");
  });

  it("renderiza markdown suportado (bold, heading, link http)", () => {
    const { container, getByText } = render(
      <MarkdownRenderer
        content={"# Título\n\n**forte** e [link](https://example.com)"}
      />,
    );
    expect(container.querySelector("h1")).not.toBeNull();
    expect(container.querySelector("strong")).not.toBeNull();
    const a = container.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com");
    expect(a?.getAttribute("rel")).toContain("noopener");
    getByText("forte");
  });
});
