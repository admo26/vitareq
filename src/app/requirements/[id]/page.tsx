"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import SectionMessage from "@atlaskit/section-message";
import Skeleton from "@atlaskit/skeleton";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

type Requirement = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "IN_REVIEW" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "ARCHIVED";
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
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirementNumber, setRequirementNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<Requirement["status"]>("DRAFT");
  const [dueDate, setDueDate] = useState("");
  const [jiraKey, setJiraKey] = useState("");

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
      setDueDate(r.dueDate ? r.dueDate.substring(0, 10) : "");
      setJiraKey(r.jiraKey ?? "");
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

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Edit requirement</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 640 }}>
          <Skeleton height={36} width="100%" />
          <Skeleton height={96} width="100%" />
          <Skeleton height={36} width="100%" />
          <Skeleton height={36} width="100%" />
          <Skeleton height={36} width="100%" />
          <Skeleton height={36} width="40%" />
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 640 }}>
          <TextField name="title" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder="Title" />
          <TextArea name="description" value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} placeholder="Description" />
          <TextField name="requirementNumber" value={requirementNumber} onChange={(e) => setRequirementNumber((e.target as HTMLInputElement).value)} onBlur={() => setRequirementNumber((v) => v.trim().toUpperCase())} placeholder="Requirement number (e.g. ABC-123)" />
          <TextField name="jiraKey" value={jiraKey} onChange={(e) => setJiraKey((e.target as HTMLInputElement).value)} onBlur={() => setJiraKey((v) => v.trim().toUpperCase())} placeholder="Linked Jira Work Item (e.g. ABC-123)" />
          <TextField name="owner" value={owner} onChange={(e) => setOwner((e.target as HTMLInputElement).value)} placeholder="Owner" />
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
          <TextField name="dueDate" value={dueDate} onChange={(e) => setDueDate((e.target as HTMLInputElement).value)} placeholder="Due date" type="date" />
          <div style={{ display: "flex", gap: 8 }}>
            <Button appearance="subtle" onClick={() => router.push("/requirements")}>Cancel</Button>
            <Button appearance="primary" onClick={save} isDisabled={!title.trim() || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

