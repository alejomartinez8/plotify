import { describe, it, expect, afterEach, vi } from "vitest";
import {
  parseLocalDate,
  formatDateForStorage,
  formatDateForDisplay,
  calculateSimpleLotBalances,
} from "./utils";

// Regression tests for the "Activo desde" timezone bug: 2026-01-01 was
// displayed as 2025-12-31. Root cause: Lot.maintenanceActiveFrom (and
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

describe("calculateSimpleLotBalances — debt breakdown by category", () => {
  const lots = [
    {
      id: "1",
      lotNumber: "101",
      owner: "Ana",
      initialWorksDebt: 0,
      stage: 1,
      maintenanceActiveFrom: null,
    },
    {
      id: "2",
      lotNumber: "102",
      owner: "Beto",
      initialWorksDebt: 10000,
      stage: 1,
      maintenanceActiveFrom: null,
    },
  ];

  const quotaConfigs = [
    {
      id: "q1",
      quotaType: "maintenance",
      amount: 50000,
      dueDate: "2026-01-01",
    },
    {
      id: "q2",
      quotaType: "works",
      amount: 30000,
      dueDate: "2026-01-01",
      stages: [1],
    },
  ];

  it("splits debt into maintenance and works, keeping others at 0", () => {
    const contributions = [
      { lotId: "2", type: "works", amount: 5000, date: "2026-01-02" },
    ];

    const [lotOne, lotTwo] = calculateSimpleLotBalances(
      lots,
      contributions,
      quotaConfigs
    ).sort((a, b) => a.lotId.localeCompare(b.lotId));

    expect(lotOne.debtByCategory).toEqual({
      maintenance: 50000,
      works: 30000,
      others: 0,
    });
    expect(lotOne.outstandingBalance).toBe(80000);

    // Lot 2: works quota (30000) + initial works debt (10000) - contribution (5000)
    expect(lotTwo.debtByCategory).toEqual({
      maintenance: 50000,
      works: 35000,
      others: 0,
    });
    expect(lotTwo.outstandingBalance).toBe(85000);
  });

  it("does not offset unpaid maintenance debt with a works overpayment", () => {
    const contributions = [
      // Overpays works by 70000, leaves maintenance untouched.
      { lotId: "1", type: "works", amount: 100000, date: "2026-01-02" },
    ];

    const [lotOne] = calculateSimpleLotBalances(
      lots,
      contributions,
      quotaConfigs
    ).filter((lot) => lot.lotId === "1");

    expect(lotOne.debtByCategory).toEqual({
      maintenance: 50000,
      works: 0,
      others: 0,
    });
    expect(lotOne.status).toBe("overdue");
  });
});

describe("calculateSimpleLotBalances — works quotas are scoped by stage and by due date, but not by when the lot joined", () => {
  const stage1Lot = {
    id: "1",
    lotNumber: "101",
    owner: "Ana",
    initialWorksDebt: 0,
    stage: 1,
    maintenanceActiveFrom: null,
  };
  const stage2Lot = {
    id: "2",
    lotNumber: "E2-1",
    owner: "Beto",
    initialWorksDebt: 0,
    stage: 2,
    maintenanceActiveFrom: null,
  };

  it("only charges a stage-1-only works quota (e.g. vías) to stage 1 lots", () => {
    const quotaConfigs = [
      {
        id: "q1",
        quotaType: "works",
        amount: 500000,
        dueDate: "2026-01-01",
        stages: [1],
      },
    ];

    const [lotOne, lotTwo] = calculateSimpleLotBalances(
      [stage1Lot, stage2Lot],
      [],
      quotaConfigs
    ).sort((a, b) => a.lotId.localeCompare(b.lotId));

    expect(lotOne.debtByCategory.works).toBe(500000);
    expect(lotTwo.debtByCategory.works).toBe(0);
  });

  it("does not charge a works quota before its due date", () => {
    const quotaConfigs = [
      {
        id: "q1",
        quotaType: "works",
        amount: 500000,
        dueDate: "2099-01-01",
        stages: [1],
      },
    ];

    const [lot] = calculateSimpleLotBalances([stage1Lot], [], quotaConfigs);

    expect(lot.debtByCategory.works).toBe(0);
  });

  it("charges a both-stages works quota (e.g. portón) to every lot once due, regardless of when the lot joined", () => {
    const quotaConfigs = [
      {
        id: "q1",
        quotaType: "works",
        amount: 300000,
        dueDate: "2026-01-01",
        stages: [1, 2],
      },
    ];
    // A lot that only became active later (maintenanceActiveFrom in the
    // future) would exclude date-gated maintenance quotas, but works
    // quotas are only gated by their own due date and the lot's stage —
    // not by when the lot itself became active — so it should still owe
    // the full amount.
    const lateJoiningStage2Lot = {
      ...stage2Lot,
      maintenanceActiveFrom: "2099-01-01",
    };

    const [lot] = calculateSimpleLotBalances(
      [lateJoiningStage2Lot],
      [],
      quotaConfigs
    );

    expect(lot.debtByCategory.works).toBe(300000);
  });
});

// Regression test for the Lote 48 bug: a lot with a negotiated
// maintenanceActiveFrom date must not be charged for maintenance quotas
// due before that date, and contributions made before it don't offset
// later quotas either.
describe("calculateSimpleLotBalances — maintenanceActiveFrom gates maintenance debt only", () => {
  it("excludes maintenance quotas due before maintenanceActiveFrom from the debt", () => {
    const lot = {
      id: "1",
      lotNumber: "48",
      owner: "Camila Maya",
      initialWorksDebt: 0,
      stage: 2,
      maintenanceActiveFrom: "2026-03-01",
    };
    const quotaConfigs = [
      {
        id: "q1",
        quotaType: "maintenance",
        amount: 60000,
        dueDate: "2026-01-01",
      },
      {
        id: "q2",
        quotaType: "maintenance",
        amount: 60000,
        dueDate: "2026-02-01",
      },
      {
        id: "q3",
        quotaType: "maintenance",
        amount: 60000,
        dueDate: "2026-03-01",
      },
    ];

    const [balance] = calculateSimpleLotBalances([lot], [], quotaConfigs);

    // Only the March quota (>= activeFrom) applies; January and February
    // are excluded even though contributions is empty.
    expect(balance.debtByCategory.maintenance).toBe(60000);
  });
});
