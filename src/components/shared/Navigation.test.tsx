import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navigation from "@/components/shared/Navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function renderedHrefs() {
  return screen.getAllByRole("link").map((link) => link.getAttribute("href"));
}

describe("Navigation", () => {
  it("hides community-wide sections from owners", () => {
    render(<Navigation />);

    const hrefs = renderedHrefs();
    expect(hrefs).toEqual(["/", "/income", "/quotas"]);
  });

  it("shows expenses and other income to users with full access", () => {
    render(<Navigation showCommunityData />);

    const hrefs = renderedHrefs();
    expect(hrefs).toContain("/expenses");
    expect(hrefs).toContain("/other-income");
    expect(hrefs).not.toContain("/admin");
  });

  it("shows the admin section to admins", () => {
    render(<Navigation isAdmin showCommunityData />);

    expect(renderedHrefs()).toContain("/admin");
  });
});
