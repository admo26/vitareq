import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Clean existing (idempotent-ish demo reset)
  await prisma.requirement.deleteMany();
  await prisma.risk.deleteMany();

  // Generate 30 risks
  const riskBaseNames = [
    "Vitamin D3 Gummies Launch",
    "Q%Q GMP Internal Audit",
    "Labeling Compliance",
    "Omega-3 Softgels",
    "Probiotics Program",
    "Organic Certification",
    "Claims Substantiation",
    "Sustainability Initiative",
    "Supplier Qualification",
    "Elderberry SKU Refresh",
  ];
  const riskStatuses: ("OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED")[] = [
    "OPEN",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "ARCHIVED",
  ];
  const createdRisks: { id: string }[] = [];
  for (let i = 1; i <= 30; i++) {
    const base = riskBaseNames[i % riskBaseNames.length].replace("%Q", `Q${((i % 4) || 4)}`);
    const name = `${base} ${2024 + Math.floor(i / 12)}`.trim();
    const status = riskStatuses[i % riskStatuses.length];
    const summary = `${name} - risk overview, mitigations and monitoring.`;
    const d = await prisma.risk.create({
      data: { name, status, summary },
      select: { id: true },
    });
    createdRisks.push(d);
  }

  // Generate 30 requirements
  const reqTitles = [
    "FDA supplement labeling compliance (21 CFR 101)",
    "GMP batch record SOP update (21 CFR 111)",
    "Allergen and cross-contact statement template",
    "COA spec limits for Vitamin D3 gummies",
    "Claims substantiation dossier: immune support",
    "Organic certification documentation checklist",
    "Stability study protocol for probiotics",
    "Heavy metals testing plan (USP <233>)",
    "Packaging migration study for gummies",
    "Microbiology limits verification (USP <2021>/<2022>)",
    "Non-GMO documentation for Vitamin C",
    "Kosher/Halal certification updates",
    "Adverse event reporting SOP refresh",
    "Label artwork review checklist",
    "Shelf-life assignment justification",
  ];
  const owners = [
    "Regulatory Team",
    "Quality Assurance",
    "Regulatory Affairs",
    "R&D Lab",
    "Clinical & Science",
    "Supply Chain",
    "Operations",
    "Legal",
    "Marketing",
  ];
  const reqStatuses: ("DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED")[] = [
    "DRAFT",
    "IN_REVIEW",
    "APPROVED",
    "ARCHIVED",
  ];

  for (let i = 1; i <= 30; i++) {
    const title = reqTitles[i % reqTitles.length];
    const description = `${title} - vitamins/wellness compliance task #${i}.`;
    const status = reqStatuses[i % reqStatuses.length];
    const requirementNumber = `SUPP-${300 + i}`;
    const owner = owners[i % owners.length];
    const dueDate = new Date(Date.now() + (i - 15) * 86400000);
    const riskId = createdRisks[(i * 7) % createdRisks.length]?.id;
    await prisma.requirement.create({
      data: { title, description, status, requirementNumber, owner, dueDate, riskId },
    });
  }

  console.log("Seed completed with 30 risks and 30 requirements.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


