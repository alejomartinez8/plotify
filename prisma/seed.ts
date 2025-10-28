import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.contribution.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.lot.deleteMany();

  // Mock lots data with clearly fake names and numbers
  const lotsData = [
    { lotNumber: "A01", owner: "TEST USER ONE" },
    { lotNumber: "A02", owner: "TEST USER TWO" },
    { lotNumber: "A03", owner: "TEST USER THREE" },
    { lotNumber: "B01", owner: "TEST USER FOUR" },
    { lotNumber: "B02", owner: "TEST USER FIVE" },
    { lotNumber: "B03", owner: "TEST USER SIX" },
    { lotNumber: "C01", owner: "TEST USER SEVEN" },
    { lotNumber: "C02", owner: "TEST USER EIGHT" },
    { lotNumber: "C03", owner: "TEST USER NINE" },
    { lotNumber: "D01", owner: "TEST USER TEN" },
    { lotNumber: "D02", owner: "TEST USER ELEVEN" },
    { lotNumber: "D03", owner: "TEST USER TWELVE" },
  ];

  for (const lotData of lotsData) {
    await prisma.lot.create({
      data: lotData,
    });
  }

  console.log(`Created ${lotsData.length} mock lots`);

  const lots = await prisma.lot.findMany();
  const contributions = [];

  // Create mock contributions for different lots
  const mockDates = [
    new Date(2025, 0, 15), // January 15, 2025
    new Date(2025, 1, 10), // February 10, 2025
    new Date(2025, 2, 5), // March 5, 2025
    new Date(2025, 3, 20), // April 20, 2025
    new Date(2025, 4, 12), // May 12, 2025
  ];

  // Add maintenance contributions for multiple lots
  for (let i = 0; i < lots.length; i++) {
    const lot = lots[i];
    const numContributions = Math.floor(Math.random() * 3) + 1; // 1-3 contributions per lot

    for (let j = 0; j < numContributions; j++) {
      const dateIndex = Math.floor(Math.random() * mockDates.length);
      const amounts = [50000, 60000, 75000, 80000, 100000]; // Various amounts
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      contributions.push({
        lotId: lot.id,
        type: "maintenance",
        amount: amount,
        date: mockDates[dateIndex],
        description: `MOCK Maintenance payment ${j + 1} for ${lot.lotNumber}`,
      });
    }
  }

  // Add some works contributions
  const selectedLotsForWorks = lots.slice(0, 6); // First 6 lots get works contributions
  for (const lot of selectedLotsForWorks) {
    contributions.push({
      lotId: lot.id,
      type: "works",
      amount: 200000,
      date: new Date(2025, 0, 20),
      description: `MOCK Works contribution for ${lot.lotNumber} - Security upgrade`,
    });
  }

  // Add extra works contributions for some lots
  const extraWorksLots = lots.slice(3, 8);
  for (const lot of extraWorksLots) {
    contributions.push({
      lotId: lot.id,
      type: "works",
      amount: 150000,
      date: new Date(2025, 2, 15),
      description: `MOCK Works contribution for ${lot.lotNumber} - Infrastructure`,
    });
  }

  for (const contribution of contributions) {
    await prisma.contribution.create({
      data: contribution,
    });
  }

  console.log(`Created ${contributions.length} mock contributions`);

  // Mock expenses data
  const mockExpenses = [
    {
      type: "maintenance",
      amount: 120000,
      date: "2025-01-10",
      description: "MOCK - Security camera replacement",
      category: "Security",
    },
    {
      type: "maintenance",
      amount: 85000,
      date: "2025-01-15",
      description: "MOCK - Garden maintenance by contractor",
      category: "Landscaping",
    },
    {
      type: "maintenance",
      amount: 200000,
      date: "2025-02-01",
      description: "MOCK - Street lighting repair and upgrade",
      category: "Infrastructure",
    },
    {
      type: "maintenance",
      amount: 65000,
      date: "2025-02-05",
      description: "MOCK - Cleaning supplies and materials",
      category: "Supplies",
    },
    {
      type: "maintenance",
      amount: 180000,
      date: "2025-02-20",
      description: "MOCK - Water system maintenance",
      category: "Utilities",
    },
    {
      type: "maintenance",
      amount: 95000,
      date: "2025-03-01",
      description: "MOCK - Electrical repairs main gate",
      category: "Electrical",
    },
    {
      type: "maintenance",
      amount: 140000,
      date: "2025-03-10",
      description: "MOCK - Monthly security service payment",
      category: "Security",
    },
    {
      type: "maintenance",
      amount: 75000,
      date: "2025-03-15",
      description: "MOCK - Road maintenance materials",
      category: "Infrastructure",
    },
    {
      type: "works",
      amount: 500000,
      date: "2025-01-25",
      description: "MOCK - New gate installation materials",
      category: "Infrastructure",
    },
    {
      type: "works",
      amount: 300000,
      date: "2025-01-30",
      description: "MOCK - Gate installation labor costs",
      category: "Labor",
    },
    {
      type: "works",
      amount: 800000,
      date: "2025-02-10",
      description: "MOCK - Security system upgrade equipment",
      category: "Security",
    },
    {
      type: "works",
      amount: 450000,
      date: "2025-02-15",
      description: "MOCK - Security system installation and setup",
      category: "Security",
    },
    {
      type: "works",
      amount: 1200000,
      date: "2025-03-01",
      description: "MOCK - Automated gate system motor and controls",
      category: "Automation",
    },
    {
      type: "works",
      amount: 600000,
      date: "2025-03-05",
      description: "MOCK - Gate automation installation labor",
      category: "Automation",
    },
    {
      type: "works",
      amount: 250000,
      date: "2025-03-20",
      description: "MOCK - Network infrastructure for gate system",
      category: "Technology",
    },
    {
      type: "works",
      amount: 180000,
      date: "2025-04-01",
      description: "MOCK - Final adjustments and testing",
      category: "Services",
    },
  ];

  for (const expense of mockExpenses) {
    await prisma.expense.create({
      data: expense,
    });
  }

  console.log(`Created ${mockExpenses.length} mock expenses`);
  console.log("🎭 Database seeded successfully with MOCK DATA!");
  console.log("⚠️  All data is clearly marked as MOCK/TEST/DEMO for safety");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
