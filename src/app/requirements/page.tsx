"use client";
import { useEffect, useState } from "react";
// Replacing Atlaskit Heading to avoid type mismatch in this prototype
import Button from "@atlaskit/button";
import SectionMessage from "@atlaskit/section-message";
import Lozenge from "@atlaskit/lozenge";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Skeleton from "@atlaskit/skeleton";

type Requirement = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "ARCHIVED";
  createdAt: string;
  requirementNumber?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  url?: string;
  jiraKey?: string | null;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
};

export default function RequirementsPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [items, setItems] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Requirement["status"] | "ALL">("ALL");

  type LozengeAppearance = "default" | "success" | "removed" | "inprogress" | "new" | "moved";
  const requirementStatusLabel: Record<Requirement["status"], string> = {
    DRAFT: "Draft",
    IN_REVIEW: "In review",
    IN_PROGRESS: "In progress",
    TO_DO: "To do",
    DONE: "Done",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
  };
  const requirementStatusAppearance: Record<Requirement["status"], LozengeAppearance> = {
    DRAFT: "new",
    IN_REVIEW: "inprogress",
    IN_PROGRESS: "inprogress",
    TO_DO: "new",
    DONE: "success",
    APPROVED: "success",
    ARCHIVED: "removed",
  };

  const riskAppearance: Record<NonNullable<Requirement["riskLevel"]>, LozengeAppearance> = {
    LOW: "new",
    MEDIUM: "moved",
    HIGH: "removed",
  };

  async function load() {
    setLoading(true);
    let headers: Record<string, string> = {};
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      }
    } catch {}
    const res = await axios
      .get<Requirement[]>("/api/requirements", { headers })
      .catch(async (e) => {
        const status = e?.response?.status;
        if (status === 401 && !isAuthenticated) {
          try {
            await loginWithRedirect();
          } catch {}
        } else {
          setError(e?.response?.data?.error ?? e.message);
        }
        return null;
      });
    if (res) {
      setError(null);
      setItems(res.data as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [isAuthenticated]);


  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Requirements</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <label htmlFor="req-status-filter" style={{ fontSize: 12, color: "#6B778C" }}>Filter status</label>
        <select
          id="req-status-filter"
          name="req-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{ height: 32, border: "1px solid #EBECF0", borderRadius: 3, padding: "4px 8px" }}
        >
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In review</option>
          <option value="TO_DO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
        {loading ? (
          <>
            <Skeleton height={72} width="100%" />
            <Skeleton height={72} width="100%" />
            <Skeleton height={72} width="100%" />
          </>
        ) : items
          .filter((r) => statusFilter === "ALL" ? true : r.status === statusFilter)
          .map((r) => (
          <div key={r.id} onClick={() => window.location.assign(`/requirements/${r.id}`)} className="clickable-card" style={{ border: "1px solid #EBECF0", padding: 12, borderRadius: 4, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{r.requirementNumber ? `[${r.requirementNumber}] ` : ""}{r.title}</strong>
                <div style={{ marginTop: 4, color: "#6B778C", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <Lozenge appearance={requirementStatusAppearance[r.status]}>
                    {requirementStatusLabel[r.status]}
                  </Lozenge>
                  {r.riskLevel && (
                    <Lozenge appearance={riskAppearance[r.riskLevel]} isBold>
                      {r.riskLevel}
                    </Lozenge>
                  )}
                  {r.dueDate && <span> · Due: {new Date(r.dueDate).toLocaleDateString()}</span>}
                  {r.owner && <span> · Owner: {r.owner}</span>}
                  {r.jiraKey && <span> · Jira: {r.jiraKey}</span>}
                </div>
              </div>
              <div />
            </div>
            {r.description && (
              <div style={{ marginTop: 4 }}>
                {r.description.length > 100 ? `${r.description.slice(0, 100)}…` : r.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

