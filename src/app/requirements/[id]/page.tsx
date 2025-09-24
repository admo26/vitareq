"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import SectionMessage from "@atlaskit/section-message";
import Skeleton from "@atlaskit/skeleton";
import Lozenge from "@atlaskit/lozenge";
import EditIcon from "@atlaskit/icon/glyph/edit";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

type Requirement = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "ARCHIVED";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  requirementNumber?: string | null;
  owner?: string | null;
  dueDate?: string | null;
  jiraKey?: string | null;
  createdAt: string;
};

export default function RequirementEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirementNumber, setRequirementNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<Requirement["status"]>("DRAFT");
  const [riskLevel, setRiskLevel] = useState<Requirement["riskLevel"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [jiraKey, setJiraKey] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isHeaderEditing, setIsHeaderEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");
  const isJiraKeyValid = /^[A-Z]+-\d+$/i.test(jiraKey.trim());
  const jiraBrowseUrl = isJiraKeyValid ? `https://one-atlas-loes.atlassian.net/browse/${jiraKey.trim().toUpperCase()}` : undefined;

  async function load() {
    setLoading(true);
    let headers: Record<string, string> = {};
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      } else {
        await loginWithRedirect();
        return;
      }
    } catch {}
    const res = await axios.get<Requirement>(`/api/requirements/${id}`, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    if (res) {
      const r = res.data as Requirement;
      setTitle(r.title ?? "");
      setDescription(r.description ?? "");
      setRequirementNumber(r.requirementNumber ?? "");
      setOwner(r.owner ?? "");
      setStatus(r.status);
      setRiskLevel((r.riskLevel as any) || "MEDIUM");
      setDueDate(r.dueDate ? r.dueDate.substring(0, 10) : "");
      setJiraKey(r.jiraKey ?? "");
      setCreatedAt(r.createdAt ?? "");
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  async function save() {
    setSaving(true);
    setError(null);
    let headers: Record<string, string> = {};
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      } else {
        await loginWithRedirect();
        return;
      }
    } catch {}

    const body: any = {
      title,
      description: description || null,
      status,
      riskLevel,
      requirementNumber: requirementNumber || undefined,
      owner: owner || undefined,
      dueDate: dueDate || undefined,
      jiraKey: jiraKey || undefined,
    };
    const res = await axios.put(`/api/requirements/${id}`, body, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    setSaving(false);
    if (res) {
      router.push("/requirements");
    }
  }

  async function remove() {
    if (!confirm("Delete this requirement? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    let headers: Record<string, string> = {};
    try {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      } else {
        await loginWithRedirect();
        return;
      }
    } catch {}

    const res = await axios.delete(`/api/requirements/${id}`, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    setDeleting(false);
    if (res) {
      router.push("/requirements");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/requirements" style={{ color: "#0052CC", textDecoration: "none" }}>&larr; Requirements</Link>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      {/* Header */}
      {loading ? (
        <div style={{ marginTop: 16 }}>
          <Skeleton height={28} width={320} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Skeleton height={20} width={80} />
            <Skeleton height={20} width={110} />
            <Skeleton height={20} width={140} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {isHeaderEditing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  name="requirementNumberHeader"
                  value={requirementNumber}
                  onChange={(e) => setRequirementNumber((e.target as HTMLInputElement).value)}
                  onBlur={() => setRequirementNumber((v) => v.trim().toUpperCase())}
                  placeholder="Requirement number (e.g. ABC-123)"
                />
                <div style={{ minWidth: 320 }}>
                  <TextField
                    name="titleHeader"
                    value={title}
                    onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
                    placeholder="Title"
                  />
                </div>
                <div>
                  <select
                    aria-label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Requirement["status"])}
                    style={{ height: 32, border: "1px solid #EBECF0", borderRadius: 3, padding: "4px 8px" }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="IN_REVIEW">In review</option>
                    <option value="TO_DO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                    <option value="APPROVED">Approved</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <Button appearance="subtle" onClick={() => setIsHeaderEditing(false)}>Done</Button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {requirementNumber ? `[${requirementNumber}] ` : ""}{title || "Untitled requirement"}
                </h2>
                <Lozenge appearance={requirementStatusAppearance[status]}>{requirementStatusLabel[status]}</Lozenge>
                <Button appearance="subtle" spacing="none" onClick={() => setIsHeaderEditing(true)} aria-label="Edit header" iconBefore={<EditIcon label="Edit" />}></Button>
              </>
            )}
          </div>
          <div style={{ marginTop: 4, color: "#6B778C", fontSize: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {isHeaderEditing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 220 }}>
                  <TextField name="ownerHeader" value={owner} onChange={(e) => setOwner((e.target as HTMLInputElement).value)} placeholder="Owner" />
                </div>
                <div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate((e.target as HTMLInputElement).value)}
                    style={{ height: 32, border: "1px solid #EBECF0", borderRadius: 3, padding: "4px 8px" }}
                  />
                </div>
                <div style={{ width: 220 }}>
                  <TextField
                    name="jiraHeader"
                    value={jiraKey}
                    onChange={(e) => setJiraKey((e.target as HTMLInputElement).value)}
                    onBlur={() => setJiraKey((v) => v.trim().toUpperCase())}
                    placeholder="Jira (e.g. ABC-123)"
                  />
                </div>
              </div>
            ) : (
              <>
                {owner && <span>Owner: <strong style={{ color: "#172B4D" }}>{owner}</strong></span>}
                {dueDate && <span>Due: <strong style={{ color: "#172B4D" }}>{new Date(dueDate).toLocaleDateString()}</strong></span>}
                {jiraKey && <span>Jira: <strong style={{ color: "#172B4D" }}>{jiraKey}</strong></span>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Body two-column layout with tabs */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Left column */}
        <div style={{ border: "1px solid #EBECF0", borderRadius: 4, background: "#FFF" }}>
          <div style={{ padding: 12 }}>
            {loading ? (
              <div style={{ display: "grid", gap: 12 }}>
                <Skeleton height={36} width="100%" />
                <Skeleton height={96} width="100%" />
                <Skeleton height={36} width="100%" />
                <Skeleton height={36} width="100%" />
                <Skeleton height={36} width="100%" />
                <Skeleton height={36} width="40%" />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #EBECF0", marginBottom: 12 }}>
                  <Button appearance={activeTab === "details" ? "primary" : "subtle"} spacing="compact" onClick={() => setActiveTab("details")}>Details</Button>
                  <Button appearance={activeTab === "comments" ? "primary" : "subtle"} spacing="compact" onClick={() => setActiveTab("comments")}>Comments</Button>
                  <Button appearance={activeTab === "activity" ? "primary" : "subtle"} spacing="compact" onClick={() => setActiveTab("activity")}>Activity</Button>
                </div>
                {activeTab === "details" && (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label htmlFor="title" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Title</label>
                      <TextField id="title" name="title" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder="Title" />
                    </div>
                    <div>
                      <label htmlFor="description" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Description</label>
                      <TextArea id="description" name="description" value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} placeholder="Description" minimumRows={8} />
                    </div>
                    <div>
                      <label htmlFor="requirementNumber" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Requirement number</label>
                      <TextField id="requirementNumber" name="requirementNumber" value={requirementNumber} onChange={(e) => setRequirementNumber((e.target as HTMLInputElement).value)} onBlur={() => setRequirementNumber((v) => v.trim().toUpperCase())} placeholder="e.g. ABC-123" />
                    </div>
                    <div>
                      <label htmlFor="jiraKey" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Linked Jira Work Item</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <TextField id="jiraKey" name="jiraKey" value={jiraKey} onChange={(e) => setJiraKey((e.target as HTMLInputElement).value)} onBlur={() => setJiraKey((v) => v.trim().toUpperCase())} placeholder="e.g. ABC-123" />
                        </div>
                        <Button
                          appearance="subtle"
                          onClick={() => jiraBrowseUrl && window.open(jiraBrowseUrl, "_blank")}
                          isDisabled={!isJiraKeyValid}
                        >
                          View in Jira
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="owner" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Owner</label>
                      <TextField id="owner" name="owner" value={owner} onChange={(e) => setOwner((e.target as HTMLInputElement).value)} placeholder="Owner" />
                    </div>
                    <div>
                      <label htmlFor="req-status" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Status</label>
                      <select id="req-status" name="req-status" value={status} onChange={(e) => setStatus(e.target.value as Requirement["status"])} style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}>
                        <option value="DRAFT">Draft</option>
                        <option value="IN_REVIEW">In review</option>
                        <option value="TO_DO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="DONE">Done</option>
                        <option value="APPROVED">Approved</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="req-risk" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Risk</label>
                      <select id="req-risk" name="req-risk" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as Requirement["riskLevel"])} style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dueDate" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Due date</label>
                      <TextField id="dueDate" name="dueDate" value={dueDate} onChange={(e) => setDueDate((e.target as HTMLInputElement).value)} placeholder="Due date" type="date" />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button appearance="danger" onClick={remove} isDisabled={deleting || saving}>{deleting ? "Deleting…" : "Delete"}</Button>
                      <div style={{ flex: 1 }} />
                      <Button appearance="subtle" onClick={() => router.push("/requirements")}>Cancel</Button>
                      <Button appearance="primary" onClick={save} isDisabled={!title.trim() || saving}>{saving ? "Saving…" : "Save"}</Button>
                    </div>
                  </div>
                )}
                {activeTab === "comments" && (
                  <div style={{ display: "grid", gap: 8 }}>
                    <SectionMessage title="Comments" appearance="information">
                      This is a preview-only comments area for mockups.
                    </SectionMessage>
                    <Skeleton height={56} width="100%" />
                    <Skeleton height={56} width="100%" />
                    <Skeleton height={56} width="80%" />
                  </div>
                )}
                {activeTab === "activity" && (
                  <div style={{ display: "grid", gap: 8 }}>
                    <SectionMessage title="Recent activity" appearance="discovery">
                      Audit and change history would appear here.
                    </SectionMessage>
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={20} width="70%" />
                    <Skeleton height={20} width="50%" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right column / Sidebar */}
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ border: "1px solid #EBECF0", borderRadius: 4, background: "#FFF", padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Metadata</div>
            {loading ? (
              <div style={{ display: "grid", gap: 8 }}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={16} width="70%" />
                <Skeleton height={16} width="60%" />
              </div>
            ) : (
              <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                <div><span style={{ color: "#6B778C" }}>Created:</span> {new Date(createdAt).toLocaleString()}</div>
                <div><span style={{ color: "#6B778C" }}>Requirement #:</span> {requirementNumber || "—"}</div>
                <div><span style={{ color: "#6B778C" }}>Owner:</span> {owner || "—"}</div>
                <div><span style={{ color: "#6B778C" }}>Due:</span> {dueDate ? new Date(dueDate).toLocaleDateString() : "—"}</div>
                <div><span style={{ color: "#6B778C" }}>Jira:</span> {jiraKey || "—"}</div>
              </div>
            )}
          </div>

          <div style={{ border: "1px solid #EBECF0", borderRadius: 4, background: "#FFF", padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Links</div>
            <div style={{ color: "#6B778C", fontSize: 13 }}>Linked risks and related items will appear here.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Local UI helpers
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


