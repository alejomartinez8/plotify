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

  const lots = await prisma.lot.findMany();
  const maintenanceContributions = [];

  const lot22 = lots.find((l) => l.lotNumber === "22");
  if (lot22) {
    maintenanceContributions.push({
      lotId: lot22.id,
      type: "maintenance",
      amount: 100000,
      date: new Date(2025, 0, 23),
      description: "Mantenimiento enero y febrero 2025",
    });
  }

  const lot08 = lots.find((l) => l.lotNumber === "08");
  const lot20 = lots.find((l) => l.lotNumber === "20");

  for (const lot of [lot08, lot20]) {
    if (lot) {
      maintenanceContributions.push({
        lotId: lot.id,
        type: "works",
        amount: 500000,
        date: new Date(2025, 0, 15),
        description: "Works contribution 2025",
      });

      maintenanceContributions.push({
        lotId: lot.id,
        type: "maintenance",
        amount: 720000,
        date: new Date(2025, 0, 15),
        description: "Annual maintenance payment 2025 (12 months)",
      });
    }
  }

  for (const contribution of maintenanceContributions) {
    await prisma.contribution.create({
      data: contribution,
    });
  }

  console.log(
    `Created ${maintenanceContributions.length} maintenance contributions for 2025`
  );

  const expenses = [
    {
      type: "maintenance",
      amount: 380000,
      date: "2024-10-02",
      description: "Reemplazo cámara averiada",
      category: "Seguridad",
    },
    {
      type: "maintenance",
      amount: 290000,
      date: "2024-10-05",
      description: "Mantenimiento cunetas Miguel",
      category: "Infraestructura",
    },
    {
      type: "maintenance",
      amount: 130000,
      date: "2024-10-15",
      description: "Pago mano obra 14 y 15 octubre",
      category: "Mano de obra",
    },
    {
      type: "maintenance",
      amount: 426000,
      date: "2024-10-20",
      description: "Compra 3 lámparas iluminación externa",
      category: "Iluminación",
    },
    {
      type: "maintenance",
      amount: 260000,
      date: "2024-10-22",
      description: "Cambio lámparas externas",
      category: "Iluminación",
    },
    {
      type: "maintenance",
      amount: 350000,
      date: "2024-11-10",
      description: "Poda vías internas y externas",
      category: "Jardinería",
    },
    {
      type: "maintenance",
      amount: 440000,
      date: "2024-11-15",
      description: "Reintegro dinero lámparas Alejandro Martinez",
      category: "Reembolso",
    },
    {
      type: "maintenance",
      amount: 240000,
      date: "2024-12-07",
      description: "Mantenimiento cunetas Miguel - 4 días",
      category: "Infraestructura",
    },
    {
      type: "maintenance",
      amount: 350000,
      date: "2024-12-14",
      description: "Mantenimiento cunetas Miguel - 6 días",
      category: "Infraestructura",
    },
    {
      type: "maintenance",
      amount: 689500,
      date: "2024-12-20",
      description: "Materiales lámpara inferior y cámara portón abajo",
      category: "Seguridad",
    },
    {
      type: "maintenance",
      amount: 700000,
      date: "2024-12-21",
      description: "Mano obra instalación lámpara y cámara portón abajo",
      category: "Seguridad",
    },
    {
      type: "maintenance",
      amount: 426000,
      date: "2025-01-31",
      description: "Compra 3 lámparas iluminación externa",
      category: "Iluminación",
    },
    {
      type: "maintenance",
      amount: 350000,
      date: "2025-02-05",
      description: "Mantenimiento prados ingreso a Jalisco",
      category: "Jardinería",
    },
    {
      type: "maintenance",
      amount: 240000,
      date: "2025-02-11",
      description: "Mano obra cambio lámparas",
      category: "Iluminación",
    },
    {
      type: "works",
      amount: 1566000,
      date: "2025-01-25",
      description: "Material portón inferior",
      category: "Infraestructura",
    },
    {
      type: "works",
      amount: 680000,
      date: "2025-01-26",
      description: "Mano de obra portón inferior",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 127600,
      date: "2025-01-27",
      description: "Pago tubería electricidad y taladro",
      category: "Herramientas",
    },
    {
      type: "works",
      amount: 1800000,
      date: "2025-01-29",
      description: "Compra material electricidad",
      category: "Electricidad",
    },
    {
      type: "works",
      amount: 315000,
      date: "2025-01-30",
      description: "Alquiler formaletas y pulidora",
      category: "Herramientas",
    },
    {
      type: "works",
      amount: 1000000,
      date: "2025-01-30",
      description: "Pago mano obra Joan/Angel portón inf",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 80000,
      date: "2025-01-31",
      description: "Pago mano obra muro falso",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 1024500,
      date: "2025-02-01",
      description: "Material ferretería",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 600000,
      date: "2025-02-01",
      description: "Mano obra electricidad portón",
      category: "Electricidad",
    },
    {
      type: "works",
      amount: 410000,
      date: "2025-02-03",
      description: "Material cambio portón a corredizo",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 610000,
      date: "2025-02-04",
      description: "2 ángulos y 2 tubos cuadrados con acarreo",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 500000,
      date: "2025-02-05",
      description: "Mano de obra portón inferior cambio a corredizo",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 20000,
      date: "2025-02-05",
      description: "Compra 4 metros tubo faltante",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 100000,
      date: "2025-02-06",
      description: "Visita de instrucción instalador motor",
      category: "Servicios",
    },
    {
      type: "works",
      amount: 7236200,
      date: "2025-02-16",
      description:
        "Motor, cremallera, tar wifi, controles, regulador, matrix, fotoceldas",
      category: "Automatización",
    },
    {
      type: "works",
      amount: 750000,
      date: "2025-02-16",
      description: "Mano obra instalación motor",
      category: "Automatización",
    },
    {
      type: "works",
      amount: 800000,
      date: "2025-02-17",
      description: "Material y mano obra extensión internet al portón",
      category: "Telecomunicaciones",
    },
    {
      type: "works",
      amount: 256000,
      date: "2025-02-15",
      description: "Caja intemperie + domicilio",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 200000,
      date: "2025-03-01",
      description: "Pago mano obra ayudante portón inf",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 636500,
      date: "2025-03-16",
      description: "Pago material ferretería muros inferior",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 520000,
      date: "2025-03-16",
      description: "Pago mano obra muros portón inferior",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 60000,
      date: "2025-03-20",
      description: "Pago visita mantenimiento portón",
      category: "Mantenimiento",
    },
    {
      type: "works",
      amount: 32500,
      date: "2025-03-20",
      description: "Recarga sim tigo portón",
      category: "Telecomunicaciones",
    },
    {
      type: "works",
      amount: 180000,
      date: "2025-04-28",
      description: "Pago mano obra pendiente portón inferior",
      category: "Mano de obra",
    },
    {
      type: "works",
      amount: 160000,
      date: "2025-05-09",
      description: "Mantenimiento cámaras",
      category: "Seguridad",
    },
    {
      type: "works",
      amount: 32500,
      date: "2025-05-15",
      description: "Recarga sim tigo portón",
      category: "Telecomunicaciones",
    },
    {
      type: "works",
      amount: 200000,
      date: "2025-06-01",
      description: "Mano de obra reja seguridad portón chucho",
      category: "Seguridad",
    },
    {
      type: "works",
      amount: 158800,
      date: "2025-06-04",
      description: "Materiales ferretería Jalisco",
      category: "Materiales",
    },
    {
      type: "works",
      amount: 160000,
      date: "2025-06-10",
      description: "Internet porterial / config DVR",
      category: "Telecomunicaciones",
    },
    {
      type: "works",
      amount: 160000,
      date: "2025-06-09",
      description: "Técnico motor config tarj wifi y tarj SMS",
      category: "Automatización",
    },
    {
      type: "works",
      amount: 300000,
      date: "2025-06-19",
      description: "Mantenimiento poda de vías",
      category: "Mantenimiento",
    },
    {
      type: "works",
      amount: 150000,
      date: "2025-06-28",
      description: "Cambio lámpara",
      category: "Iluminación",
    },
    {
      type: "works",
      amount: 58000,
      date: "2025-07-17",
      description: "Compra alambre cuchilla",
      category: "Seguridad",
    },
    {
      type: "works",
      amount: 4341300,
      date: "2025-07-21",
      description: "Material vía inferior",
      category: "Infraestructura",
    },
    {
      type: "works",
      amount: 240000,
      date: "2025-07-21",
      description: "Pago ayudante obra vía inferior",
      category: "Mano de obra",
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
