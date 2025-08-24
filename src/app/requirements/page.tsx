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
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";
  createdAt: string;
  requirementNumber?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  url?: string;
};

export default function RequirementsPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [items, setItems] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  type LozengeAppearance = "default" | "success" | "removed" | "inprogress" | "new" | "moved";
  const requirementStatusLabel: Record<Requirement["status"], string> = {
    DRAFT: "Draft",
    IN_REVIEW: "In review",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
  };
  const requirementStatusAppearance: Record<Requirement["status"], LozengeAppearance> = {
    DRAFT: "new",
    IN_REVIEW: "inprogress",
    APPROVED: "success",
    ARCHIVED: "removed",
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

      <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
        {loading ? (
          <>
            <Skeleton height={72} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </>
        ) : items.map((r) => (
          <div key={r.id} style={{ border: "1px solid #EBECF0", padding: 12, borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{r.requirementNumber ? `[${r.requirementNumber}] ` : ""}{r.title}</strong>
                <div style={{ marginTop: 4, color: "#6B778C", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <Lozenge appearance={requirementStatusAppearance[r.status]}>
                    {requirementStatusLabel[r.status]}
                  </Lozenge>
                  {r.dueDate && <span> · Due: {new Date(r.dueDate).toLocaleDateString()}</span>}
                  {r.owner && <span> · Owner: {r.owner}</span>}
                </div>
              </div>
              <Button appearance="subtle" onClick={async () => {
                await axios.delete(`/api/requirements/${r.id}`).catch((e) => setError(e?.response?.data?.error ?? e.message));
                load();
              }}>Delete</Button>
            </div>
            {r.description && <div style={{ marginTop: 4 }}>{r.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

