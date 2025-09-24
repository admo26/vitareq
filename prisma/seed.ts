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

  // Generate specified 20 requirements (VREQ-001..020)
  const owners = [
    "Ava Chen",
    "Marcus Patel",
    "Lena Gómez",
    "Noah Williams",
    "Priya Shah",
    "Diego Martínez",
    "Sara Ahmed",
    "Kenji Tanaka",
    "Maya Rossi",
    "Oliver Brown",
    "Fatima Khan",
    "Jonas Müller",
  ];
  const reqStatuses: (
    | "DRAFT"
    | "IN_REVIEW"
    | "IN_PROGRESS"
    | "TO_DO"
    | "DONE"
    | "APPROVED"
    | "ARCHIVED"
  )[] = ["DRAFT", "IN_REVIEW", "IN_PROGRESS", "TO_DO", "DONE", "APPROVED", "ARCHIVED"];

  const dayMs = 86400000;
  const daysFromNow = (days: number) => new Date(Date.now() + days * dayMs);

  const requirements: {
    requirementNumber: string;
    title: string;
    description: string;
    status: (typeof reqStatuses)[number];
    owner: string;
    dueDate: Date;
  }[] = [
    {
      requirementNumber: "VREQ-001",
      title: "End-to-end batch traceability for Omega‑3 Gummies V2",
      description:
        "Capture supplier lot, mixing vessel, fill line, and pallet IDs. Provide 2-click recall list generation within 5 minutes.",
      status: "IN_PROGRESS",
      owner: owners[0],
      dueDate: daysFromNow(14),
    },
    {
      requirementNumber: "VREQ-002",
      title: "Allergen disclosure completeness",
      description:
        "System must enforce presence of top-9 allergen checks and free-from statements before labeling moves to artwork approval.",
      status: "IN_REVIEW",
      owner: owners[1],
      dueDate: daysFromNow(3),
    },
    {
      requirementNumber: "VREQ-003",
      title: "Stability study scheduling for ImmunoBoost Plus",
      description:
        "Generate ICH-style stability pulls at 0, 3, 6, 9, 12 months and flag overdue pulls to QA.",
      status: "TO_DO",
      owner: owners[2],
      dueDate: daysFromNow(45),
    },
    {
      requirementNumber: "VREQ-004",
      title: "Cold-chain integrity for probiotic chewables",
      description:
        "Record lane temperature from sensor ingest during transport and block GRN if excursions exceed threshold.",
      status: "DRAFT",
      owner: owners[3],
      dueDate: daysFromNow(21),
    },
    {
      requirementNumber: "VREQ-005",
      title: "Claims substantiation evidence registry",
      description:
        "Link each on-pack claim to at least one study reference and QA sign-off prior to market release.",
      status: "IN_PROGRESS",
      owner: owners[4],
      dueDate: daysFromNow(-7),
    },
    {
      requirementNumber: "VREQ-006",
      title: "Adverse event intake triage",
      description: "Route events to medical review within 24 hours. Mask PII in exports.",
      status: "DONE",
      owner: owners[5],
      dueDate: daysFromNow(-30),
    },
    {
      requirementNumber: "VREQ-007",
      title: "Supplier quality rating synchronization",
      description: "Pull monthly vendor quality scores and gate high-risk ingredients.",
      status: "APPROVED",
      owner: owners[6],
      dueDate: daysFromNow(-14),
    },
    {
      requirementNumber: "VREQ-008",
      title: "Packaging artwork version control",
      description:
        "Retain history and diffs for all label changes. Prevent printing from unapproved versions.",
      status: "IN_REVIEW",
      owner: owners[7],
      dueDate: daysFromNow(7),
    },
    {
      requirementNumber: "VREQ-009",
      title: "CAPA linkage to requirements",
      description:
        "Allow CAPA records to reference impacted requirements and show status rollup.",
      status: "IN_PROGRESS",
      owner: owners[8],
      dueDate: daysFromNow(28),
    },
    {
      requirementNumber: "VREQ-010",
      title: "Risk matrix scoring",
      description:
        "Compute risk score R = Likelihood x Impact on a 1–5 scale and color-code cards.",
      status: "TO_DO",
      owner: owners[9],
      dueDate: daysFromNow(60),
    },
    {
      requirementNumber: "VREQ-011",
      title: "Audit trail immutability",
      description:
        "Append-only audit log for create, update, link operations. Exportable to CSV.",
      status: "APPROVED",
      owner: owners[10],
      dueDate: daysFromNow(-60),
    },
    {
      requirementNumber: "VREQ-012",
      title: "Role-based access for R&D and QA",
      description:
        "Enforce view vs edit for requirements and linked risks by role.",
      status: "DONE",
      owner: owners[11],
      dueDate: daysFromNow(-10),
    },
    {
      requirementNumber: "VREQ-013",
      title: "BOM to requirement coverage",
      description:
        "Each BOM component must link to at least one requirement or rationale.",
      status: "IN_PROGRESS",
      owner: owners[0],
      dueDate: daysFromNow(10),
    },
    {
      requirementNumber: "VREQ-014",
      title: "Label language selector",
      description:
        "Provide template-driven localization and prevent release if translations are incomplete.",
      status: "IN_REVIEW",
      owner: owners[1],
      dueDate: daysFromNow(5),
    },
    {
      requirementNumber: "VREQ-015",
      title: "Deviation to requirement impact analysis",
      description:
        "On deviation creation, list affected requirements and propose mitigations.",
      status: "DRAFT",
      owner: owners[2],
      dueDate: daysFromNow(20),
    },
    {
      requirementNumber: "VREQ-016",
      title: "Regulatory dossier export",
      description:
        "One-click dossier PDF with requirements, evidence links, and approvals.",
      status: "TO_DO",
      owner: owners[3],
      dueDate: daysFromNow(30),
    },
    {
      requirementNumber: "VREQ-017",
      title: "LIMS integration for assay results",
      description:
        "Pull potency and microbiology results and flag out-of-spec lots.",
      status: "IN_PROGRESS",
      owner: owners[4],
      dueDate: daysFromNow(15),
    },
    {
      requirementNumber: "VREQ-018",
      title: "Serialization of master formulas",
      description:
        "Assign globally unique IDs to master formula versions and lock after release.",
      status: "DONE",
      owner: owners[5],
      dueDate: daysFromNow(-3),
    },
    {
      requirementNumber: "VREQ-019",
      title: "Accessibility of patient leaflet PDFs",
      description:
        "Validate WCAG AA properties on upload and block if failures remain.",
      status: "IN_REVIEW",
      owner: owners[6],
      dueDate: daysFromNow(12),
    },
    {
      requirementNumber: "VREQ-020",
      title: "Data retention and purge",
      description:
        "Enforce 7-year retention on regulated artifacts with admin-approved purge.",
      status: "ARCHIVED",
      owner: owners[7],
      dueDate: daysFromNow(-90),
    },
  ];

  for (let i = 0; i < requirements.length; i++) {
    const riskId = createdRisks[(i * 5) % createdRisks.length]?.id;
    await prisma.requirement.create({
      data: { ...requirements[i], riskId },
    });
  }

  console.log("Seed completed with 30 risks and 20 requirements.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


