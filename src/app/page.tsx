"use client";
import Link from "next/link";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Skeleton from "@atlaskit/skeleton";

type Requirement = {
  id: string;
  title: string;
  requirementNumber?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "ARCHIVED";
  owner?: string | null;
  dueDate?: string | null; // ISO date
  createdAt: string;
};

type Risk = {
  id: string;
  name: string;
  status: "OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";
};

// Live data loaded from API

function getStats(reqs: Requirement[]) {
  const total = reqs.length;
  const inReview = reqs.filter((r) => r.status === "IN_REVIEW").length;
  const approved = reqs.filter((r) => r.status === "APPROVED").length;
  const overdue = reqs.filter((r) => r.dueDate && new Date(r.dueDate).getTime() < Date.now() && r.status !== "APPROVED").length;
  return { total, inReview, approved, overdue };
}

function getStatusBreakdown(reqs: Requirement[]) {
  const counts: Record<Requirement["status"], number> = { DRAFT: 0, IN_REVIEW: 0, IN_PROGRESS: 0, TO_DO: 0, DONE: 0, APPROVED: 0, ARCHIVED: 0 };
  reqs.forEach((r) => { counts[r.status] += 1; });
  const total = reqs.length || 1;
  return {
    counts,
    percents: {
      DRAFT: Math.round((counts.DRAFT / total) * 100),
      TO_DO: Math.round((counts.TO_DO / total) * 100),
      IN_PROGRESS: Math.round((counts.IN_PROGRESS / total) * 100),
      IN_REVIEW: Math.round((counts.IN_REVIEW / total) * 100),
      DONE: Math.round((counts.DONE / total) * 100),
      APPROVED: Math.round((counts.APPROVED / total) * 100),
      ARCHIVED: Math.round((counts.ARCHIVED / total) * 100),
    },
  };
}

export default function Home() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [items, setItems] = useState<Requirement[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setItems([]);
      setRisks([]);
      setLoading(false);
      return;
    }
    let headers: Record<string, string> = {};
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
      });
      headers = { Authorization: `Bearer ${token}` };
    } catch {}
    const res = await axios
      .get<Requirement[]>("/api/requirements", { headers })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { error?: string } }, message?: string };
        setError(err?.response?.data?.error ?? err?.message ?? "Failed to load");
        return null;
      });
    if (res) {
      setError(null);
      setItems(res.data);
    }
    // Load risks as well
    const resD = await axios
      .get<Risk[]>("/api/risks", { headers })
      .catch(() => null);
    if (resD) {
      setRisks(resD.data);
    }
    setLoading(false);
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = getStats(items);
  const breakdown = getStatusBreakdown(items);
  const recent = [...items].slice(0, 5);
  const upcoming = [...items]
    .filter((r) => !!r.dueDate && new Date(r.dueDate as string).getTime() >= Date.now())
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
    .slice(0, 5);

  const requirementStatusLabel: Record<Requirement["status"], string> = {
    DRAFT: "Draft",
    TO_DO: "To do",
    IN_PROGRESS: "In progress",
    IN_REVIEW: "In review",
    DONE: "Done",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
  };
  const requirementStatusAppearance: Record<Requirement["status"], "default" | "success" | "removed" | "inprogress" | "new" | "moved"> = {
    DRAFT: "new",
    TO_DO: "new",
    IN_PROGRESS: "inprogress",
    IN_REVIEW: "inprogress",
    DONE: "success",
    APPROVED: "success",
    ARCHIVED: "removed",
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      {loading ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
            <Skeleton height={84} width="100%" />
            <Skeleton height={84} width="100%" />
            <Skeleton height={84} width="100%" />
            <Skeleton height={84} width="100%" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <Skeleton height={16} width="40%" />
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                <Skeleton height={56} width="100%" />
                <Skeleton height={56} width="100%" />
                <Skeleton height={56} width="100%" />
              </div>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
                <Skeleton height={16} width="40%" />
                <div style={{ marginTop: 10 }}>
                  <Skeleton height={10} width="100%" />
                  <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                    <Skeleton height={12} width={80} />
                    <Skeleton height={12} width={80} />
                    <Skeleton height={12} width={80} />
                    <Skeleton height={12} width={80} />
                  </div>
                </div>
              </div>
              <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
                <Skeleton height={16} width="60%" />
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  <Skeleton height={20} width="100%" />
                  <Skeleton height={20} width="100%" />
                  <Skeleton height={20} width="100%" />
                </div>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton height={16} width={160} />
              <Skeleton height={16} width={80} />
            </div>
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              <Skeleton height={56} width="100%" />
              <Skeleton height={56} width="100%" />
              <Skeleton height={56} width="100%" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <div style={{ color: "#6B778C", fontSize: 12 }}>Total requirements</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{stats.total}</div>
            </div>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <div style={{ color: "#6B778C", fontSize: 12 }}>In review</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{stats.inReview}</div>
            </div>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <div style={{ color: "#6B778C", fontSize: 12 }}>Approved</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{stats.approved}</div>
            </div>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <div style={{ color: "#6B778C", fontSize: 12 }}>Overdue</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: stats.overdue > 0 ? "#DE350B" : undefined }}>{stats.overdue}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
            <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent requirements</h3>
                <Link href="/requirements" style={{ fontSize: 12 }}>View all</Link>
              </div>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {recent.map((r) => (
                  <div key={r.id} onClick={() => window.location.assign(`/requirements/${r.id}`)} className="clickable-card" style={{ border: "1px solid #EBECF0", borderRadius: 4, padding: 10, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>[{r.requirementNumber}] {r.title}</strong>
                        <div style={{ color: "#6B778C", fontSize: 12, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                          <Lozenge appearance={requirementStatusAppearance[r.status]}>
                            {requirementStatusLabel[r.status]}
                          </Lozenge>
                          {r.owner && <span> · Owner: {r.owner}</span>}
                          {r.dueDate ? <span> · Due: {new Date(r.dueDate).toLocaleDateString()}</span> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Status breakdown</h3>
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 10, width: "100%", background: "#F4F5F7", borderRadius: 999, overflow: "hidden", display: "flex" }}>
                    <div title={`${requirementStatusLabel.DRAFT} ${breakdown.percents.DRAFT}%`} style={{ width: `${breakdown.percents.DRAFT}%`, background: "#B3D4FF" }} />
                    <div title={`${requirementStatusLabel.TO_DO} ${breakdown.percents.TO_DO}%`} style={{ width: `${breakdown.percents.TO_DO}%`, background: "#B3F5D9" }} />
                    <div title={`${requirementStatusLabel.IN_PROGRESS} ${breakdown.percents.IN_PROGRESS}%`} style={{ width: `${breakdown.percents.IN_PROGRESS}%`, background: "#FFE380" }} />
                    <div title={`${requirementStatusLabel.IN_REVIEW} ${breakdown.percents.IN_REVIEW}%`} style={{ width: `${breakdown.percents.IN_REVIEW}%`, background: "#FFAB00" }} />
                    <div title={`${requirementStatusLabel.DONE} ${breakdown.percents.DONE}%`} style={{ width: `${breakdown.percents.DONE}%`, background: "#57D9A3" }} />
                    <div title={`${requirementStatusLabel.APPROVED} ${breakdown.percents.APPROVED}%`} style={{ width: `${breakdown.percents.APPROVED}%`, background: "#36B37E" }} />
                    <div title={`${requirementStatusLabel.ARCHIVED} ${breakdown.percents.ARCHIVED}%`} style={{ width: `${breakdown.percents.ARCHIVED}%`, background: "#DFE1E6" }} />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, color: "#6B778C", fontSize: 12 }}>
                    <span>{requirementStatusLabel.DRAFT} {breakdown.counts.DRAFT}</span>
                    <span>{requirementStatusLabel.TO_DO} {breakdown.counts.TO_DO}</span>
                    <span>{requirementStatusLabel.IN_PROGRESS} {breakdown.counts.IN_PROGRESS}</span>
                    <span>{requirementStatusLabel.IN_REVIEW} {breakdown.counts.IN_REVIEW}</span>
                    <span>{requirementStatusLabel.DONE} {breakdown.counts.DONE}</span>
                    <span>{requirementStatusLabel.APPROVED} {breakdown.counts.APPROVED}</span>
                    <span>{requirementStatusLabel.ARCHIVED} {breakdown.counts.ARCHIVED}</span>
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Upcoming deadlines</h3>
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  {upcoming.map((r) => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: "#6B778C" }}>[{r.requirementNumber}]</span> {r.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B778C" }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #EBECF0", borderRadius: 6, padding: 12, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Risks</h3>
              <Link href="/risks" style={{ fontSize: 12 }}>View all</Link>
            </div>
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              {risks.slice(0, 5).map((d) => (
                <div key={d.id} onClick={() => window.location.assign(`/risks/${d.id}`)} className="clickable-card" style={{ border: "1px solid #EBECF0", borderRadius: 4, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <strong>{d.name}</strong>
                    <div style={{ color: "#6B778C", fontSize: 12, marginTop: 2 }}>Status: {d.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      
    </div>
  );
}
