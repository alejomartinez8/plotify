import { describe, it, expect } from "vitest";
import {
  hasFullDataAccess,
  filterVisibleLots,
  filterVisibleContributions,
  isLotVisible,
} from "./data-visibility";

const lots = [{ id: "lot-1" }, { id: "lot-2" }, { id: "lot-3" }];
const contributions = [
  { id: 1, lotId: "lot-1" },
  { id: 2, lotId: "lot-2" },
  { id: 3, lotId: "lot-1" },
];

describe("hasFullDataAccess", () => {
  it("grants community-wide access to admins and treasurers", () => {
    expect(hasFullDataAccess("admin")).toBe(true);
    expect(hasFullDataAccess("treasurer")).toBe(true);
  });

  it("denies community-wide access to owners and users without a role", () => {
    expect(hasFullDataAccess("owner")).toBe(false);
    expect(hasFullDataAccess(null)).toBe(false);
  });
});

describe("filterVisibleLots", () => {
  it("returns every lot when access is unrestricted", () => {
    expect(filterVisibleLots(lots, null)).toEqual(lots);
  });

  it("keeps only the visible lots", () => {
    expect(filterVisibleLots(lots, ["lot-2"])).toEqual([{ id: "lot-2" }]);
  });

  it("returns nothing when no lot is visible", () => {
    expect(filterVisibleLots(lots, [])).toEqual([]);
  });
});

describe("filterVisibleContributions", () => {
  it("returns every contribution when access is unrestricted", () => {
    expect(filterVisibleContributions(contributions, null)).toEqual(
      contributions
    );
  });

  it("keeps only contributions of visible lots", () => {
    expect(
      filterVisibleContributions(contributions, ["lot-1"]).map((c) => c.id)
    ).toEqual([1, 3]);
  });

  it("returns nothing when no lot is visible", () => {
    expect(filterVisibleContributions(contributions, [])).toEqual([]);
  });
});

describe("isLotVisible", () => {
  it("allows any lot when access is unrestricted", () => {
    expect(isLotVisible("lot-9", null)).toBe(true);
  });

  it("allows only the visible lots otherwise", () => {
    expect(isLotVisible("lot-1", ["lot-1"])).toBe(true);
    expect(isLotVisible("lot-2", ["lot-1"])).toBe(false);
  });
});
