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

type Risk = {
  id: string;
  name: string;
  summary?: string | null;
  status: "OPEN" | "SUBMITTED" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
};

export default function RiskEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<Risk["status"]>("OPEN");

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
    const res = await axios.get<Risk>(`/api/risks/${id}`, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    if (res) {
      const r = res.data as Risk;
      setName(r.name ?? "");
      setSummary(r.summary ?? "");
      setStatus(r.status);
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

    const body: Partial<Risk> = {
      name,
      summary: summary || null,
      status,
    };
    const res = await axios.put(`/api/risks/${id}`, body, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    setSaving(false);
    if (res) {
      router.push("/risks");
    }
  }

  async function remove() {
    if (!confirm("Delete this risk? This cannot be undone.")) return;
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

    const res = await axios.delete(`/api/risks/${id}`, { headers }).catch((e) => {
      setError(e?.response?.data?.error ?? e.message);
      return null;
    });
    setDeleting(false);
    if (res) {
      router.push("/risks");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Edit risk</h2>
      {error && (
        <div style={{ marginTop: 12 }}>
          <SectionMessage appearance="error">{error}</SectionMessage>
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 640 }}>
          <Skeleton height={36} width="100%" />
          <Skeleton height={96} width="100%" />
          <Skeleton height={36} width="40%" />
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 640 }}>
          <TextField name="name" value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="Name" />
          <TextArea name="summary" value={summary} onChange={(e) => setSummary((e.target as HTMLTextAreaElement).value)} placeholder="Summary" />
          <div>
            <label htmlFor="risk-status" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Status</label>
            <select id="risk-status" name="risk-status" value={status} onChange={(e) => setStatus(e.target.value as Risk["status"])} style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}>
              <option value="OPEN">Open</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="TO_DO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button appearance="danger" onClick={remove} isDisabled={deleting || saving}>{deleting ? "Deleting…" : "Delete"}</Button>
            <div style={{ flex: 1 }} />
            <Button appearance="subtle" onClick={() => router.push("/risks")}>Cancel</Button>
            <Button appearance="primary" onClick={save} isDisabled={!name.trim() || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
