import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.contribution.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.lot.deleteMany();

  // Seed lots
  const lots = [
    { id: "0", owner: "JOHN DOE" },
    { id: "3", owner: "JANE SMITH" },
    { id: "4", owner: "MIKE JOHNSON" },
    { id: "5", owner: "SARAH WILSON" },
    { id: "6", owner: "DAVID BROWN" },
    { id: "7", owner: "LISA GARCIA" },
    { id: "8", owner: "ROBERT DAVIS" },
    { id: "9", owner: "MARIA RODRIGUEZ" },
    { id: "10", owner: "JAMES MILLER" },
    { id: "11", owner: "ANNA TAYLOR" },
    { id: "12", owner: "CARLOS ANDERSON" },
    { id: "13", owner: "EMMA THOMAS" },
    { id: "14", owner: "DANIEL JACKSON" },
    { id: "15", owner: "SOPHIA WHITE" },
    { id: "16", owner: "MATTHEW HARRIS" },
    { id: "17", owner: "OLIVIA MARTIN" },
    { id: "18", owner: "ANDREW THOMPSON" },
    { id: "20", owner: "ISABELLA GARCIA" },
    { id: "21", owner: "WILLIAM MARTINEZ" },
    { id: "22", owner: "CHARLOTTE ROBINSON" },
    { id: "23", owner: "BENJAMIN CLARK" },
    { id: "24", owner: "AMELIA RODRIGUEZ" },
    { id: "25", owner: "LUCAS LEWIS" },
    { id: "26", owner: "HARPER LEE" },
    { id: "27", owner: "HENRY WALKER" },
    { id: "29", owner: "EVELYN HALL" },
    { id: "31", owner: "SEBASTIAN ALLEN" },
    { id: "E2-1", owner: "NOAH/GRACE YOUNG" },
    { id: "E2-2", owner: "LIAM HERNANDEZ" },
    { id: "E2-3", owner: "AVA KING" },
    { id: "E2-4", owner: "MASON WRIGHT" },
    { id: "E2-5", owner: "MIA LOPEZ" },
    { id: "E2-6", owner: "ETHAN HILL" },
    { id: "E2-7", owner: "LUNA SCOTT" },
    { id: "E2-8", owner: "JACOB GREEN" },
  ];

  for (const lot of lots) {
    await prisma.lot.create({
      data: lot,
    });
  }

  // Seed contributions
  const contributions = [
    {
      lotId: "22",
      type: "maintenance",
      amount: 150000,
      month: "JAN",
      year: 2024,
      date: "2024-01-05",
      description: "Basic maintenance fee",
    },
    {
      lotId: "E2-1",
      type: "works",
      amount: 500000,
      month: "MAR",
      year: 2024,
      date: "2024-03-15",
      description: "Street lighting installation",
    },
    {
      lotId: "14",
      type: "maintenance",
      amount: 180000,
      month: "APR",
      year: 2024,
      date: "2024-04-22",
      description: "Garden maintenance and cleaning",
    },
    {
      lotId: "E2-3",
      type: "works",
      amount: 320000,
      month: "MAY",
      year: 2024,
      date: "2024-05-10",
      description: "Security gate installation",
    },
  ];

  for (const contribution of contributions) {
    await prisma.contribution.create({
      data: contribution,
    });
  }

  // Seed expenses
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
