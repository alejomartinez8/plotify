import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.contribution.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.lot.deleteMany();

  const lotsData = [
    { lotNumber: "00", owner: "JUDITH" },
    { lotNumber: "03", owner: "JAMER" },
    { lotNumber: "04", owner: "ALEXANDER" },
    { lotNumber: "05", owner: "EDISSON" },
    { lotNumber: "06", owner: "MARIBEL VALDEZ" },
    { lotNumber: "07", owner: "JORGE GOMEZ" },
    { lotNumber: "08", owner: "SERGIO QUINTERO" },
    { lotNumber: "09", owner: "KELLY QUINTERO" },
    { lotNumber: "10", owner: "ALEX" },
    { lotNumber: "11", owner: "SERGIO ROLDAN" },
    { lotNumber: "12", owner: "ADRIANA VILLADA" },
    { lotNumber: "13", owner: "MIRYAM" },
    { lotNumber: "14", owner: "STYLACHO" },
    { lotNumber: "15", owner: "DARLY" },
    { lotNumber: "16", owner: "LUISA OLARTE" },
    { lotNumber: "17", owner: "GLORIA" },
    { lotNumber: "18 Y 19", owner: "JUAN ALEJANDRO" },
    { lotNumber: "20", owner: "JUAN OLARTE" },
    { lotNumber: "21", owner: "KEVIN" },
    { lotNumber: "22", owner: "ALEJANDRO MARTINEZ" },
    { lotNumber: "23", owner: "JESSICA" },
    { lotNumber: "24", owner: "DIANA" },
    { lotNumber: "25", owner: "WILMAR" },
    { lotNumber: "26", owner: "MILENA" },
    { lotNumber: "27 Y 28", owner: "AGUSTIN" },
    { lotNumber: "29", owner: "LUIS CARVAJAL" },
    { lotNumber: "31", owner: "YESICA" },
    { lotNumber: "E2-1", owner: "RICARDO/LILIANA" },
    { lotNumber: "E2-2", owner: "CAMILA" },
    { lotNumber: "E2-3", owner: "EDGAR" },
    { lotNumber: "E2-4", owner: "LEIDY" },
    { lotNumber: "E2-5", owner: "LEWIS" },
    { lotNumber: "E2-6", owner: "EDISON" },
    { lotNumber: "E2-7", owner: "JORGE" },
    { lotNumber: "E2-8", owner: "MONICA RAMIREZ" },
  ];

  for (const lotData of lotsData) {
    await prisma.lot.create({
      data: lotData,
    });
  }

  console.log(`Created ${lotsData.length} lots`);

  const contributionsData = [
    {
      lotNumber: "22",
      type: "maintenance",
      amount: 150000,
      month: "JAN",
      year: 2024,
      date: "2024-01-05",
      description: "Basic maintenance fee",
    },
    {
      lotNumber: "E2-1",
      type: "works",
      amount: 500000,
      month: "MAR",
      year: 2024,
      date: "2024-03-15",
      description: "Street lighting installation",
    },
    {
      lotNumber: "14",
      type: "maintenance",
      amount: 180000,
      month: "APR",
      year: 2024,
      date: "2024-04-22",
      description: "Garden maintenance and cleaning",
    },
    {
      lotNumber: "E2-3",
      type: "works",
      amount: 320000,
      month: "MAY",
      year: 2024,
      date: "2024-05-10",
      description: "Security gate installation",
    },
  ];

  for (const contributionData of contributionsData) {
    const lot = await prisma.lot.findUnique({
      where: { lotNumber: contributionData.lotNumber },
    });

    if (lot) {
      await prisma.contribution.create({
        data: {
          lotId: lot.id,
          type: contributionData.type,
          amount: contributionData.amount,
          month: contributionData.month,
          year: contributionData.year,
          date: contributionData.date,
          description: contributionData.description,
        },
      });
    } else {
      console.warn(`Lot with number ${contributionData.lotNumber} not found`);
    }
  }

  console.log(`Created ${contributionsData.length} contributions`);

  const expenses = [
    {
      type: "maintenance",
      amount: 120000,
      date: "2024-01-08",
      description: "Landscaping and tree trimming",
      category: "Gardening",
    },
    {
      type: "works",
      amount: 450000,
      date: "2024-03-10",
      description: "Playground equipment installation",
      category: "Community",
    },
    {
      type: "maintenance",
      amount: 180000,
      date: "2024-04-05",
      description: "Water system maintenance",
      category: "Infrastructure",
    },
    {
      type: "works",
      amount: 320000,
      date: "2024-05-12",
      description: "Street paving project",
      category: "Infrastructure",
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({
      data: expense,
    });
  }

  console.log(`Created ${expenses.length} expenses`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
