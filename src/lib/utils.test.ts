import { describe, it, expect, afterEach, vi } from "vitest";
import {
  parseLocalDate,
  formatDateForStorage,
  formatDateForDisplay,
} from "./utils";

// Regression tests for the "Activo desde" timezone bug: 2026-01-01 was
// displayed as 2025-12-31. Root cause: Lot.exemptionEndDate (and
// QuotaConfig.dueDate) used to reach "use client" components as a raw
// Prisma Date object; formatDateForDisplay/formatDateForStorage then ran
// getFullYear()/getMonth()/getDate() using the BROWSER's local timezone,
// shifting the day for any viewer behind UTC (e.g. Colombia, UTC-5).
//
// The fix converts these fields to a "YYYY-MM-DD" string on the server
// (see toLot/toContribution/toQuotaConfig in src/lib/database), so the
// browser only ever calls these helpers with a string — the branch tested
// below across every timezone.
describe.each(["UTC", "America/Bogota", "Pacific/Auckland"])(
  "date helpers with string input (TZ=%s) — the browser-safe contract",
  (tz) => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("round-trips a YYYY-MM-DD string with no day shift", () => {
      vi.stubEnv("TZ", tz);
      expect(formatDateForStorage("2026-01-01")).toBe("2026-01-01");
      expect(formatDateForDisplay("2026-01-01")).toBe("01/01/2026");
    });

    it("parseLocalDate normalises a YYYY-MM-DD string to local midnight", () => {
      vi.stubEnv("TZ", tz);
      const d = parseLocalDate("2026-01-01");
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(1);
    });

    it("write (parseLocalDate) then read (formatDateForStorage) round-trips within the same process timezone", () => {
      // Mirrors what createLot/updateLot (write) and toLot/toQuotaConfig
      // (read) do server-side, in the same process/deployment.
      vi.stubEnv("TZ", tz);
      const written = parseLocalDate("2026-01-01");
      expect(formatDateForStorage(written)).toBe("2026-01-01");
      expect(formatDateForDisplay(written)).toBe("01/01/2026");
    });
  }
);

describe("date helpers with a raw Date object — server-only contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("decodes a UTC-midnight Date correctly when the reading process is also UTC (Vercel's default runtime timezone)", () => {
    vi.stubEnv("TZ", "UTC");
    const prismaDate = new Date("2026-01-01T00:00:00.000Z");
    expect(formatDateForStorage(prismaDate)).toBe("2026-01-01");
    expect(formatDateForDisplay(prismaDate)).toBe("01/01/2026");
  });

  it("documents the known limitation: a Date object shifts by a day if read in a different timezone than the one that wrote it — this is exactly why raw Date objects must never cross the server→client boundary for these fields", () => {
    vi.stubEnv("TZ", "America/Bogota");
    const writtenByAUtcProcess = new Date("2026-01-01T00:00:00.000Z");
    expect(formatDateForStorage(writtenByAUtcProcess)).toBe("2025-12-31");
  });
});
