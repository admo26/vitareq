"use client";
import { useMemo, useState } from "react";
import Modal, { ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalTransition } from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import SectionMessage from "@atlaskit/section-message";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (type: "requirement" | "risk") => void;
  forceSimple?: boolean;
};

export default function CreateEntityModal({ isOpen, onClose, onCreated, forceSimple }: Props) {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [entityType, setEntityType] = useState<"requirement" | "risk">("requirement");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirement fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirementNumber, setRequirementNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [reqStatus, setReqStatus] = useState<"DRAFT" | "IN_REVIEW" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "ARCHIVED">("DRAFT");
  const [dueDate, setDueDate] = useState("");
  const [jiraKey, setJiraKey] = useState("");

  // Risk fields
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [dosStatus, setDosStatus] = useState<"OPEN" | "SUBMITTED" | "IN_PROGRESS" | "TO_DO" | "DONE" | "APPROVED" | "REJECTED" | "ARCHIVED">("OPEN");

  const typeOptions = useMemo(() => ([
    { label: "Requirement", value: "requirement" },
    { label: "Risk", value: "risk" },
  ]), []);

  const reqNumPattern = /^[A-Z]+-\d+$/;
  const trimmedReqNum = requirementNumber.trim();
  const reqNumValid = trimmedReqNum === "" || reqNumPattern.test(trimmedReqNum.toUpperCase());
  const jiraKeyPattern = /^[A-Z]+-\d+$/;
  const trimmedJiraKey = jiraKey.trim();
  const jiraKeyValid = trimmedJiraKey === "" || jiraKeyPattern.test(trimmedJiraKey.toUpperCase());

  function resetFields() {
    setTitle("");
    setDescription("");
    setRequirementNumber("");
    setOwner("");
    setReqStatus("DRAFT");
    setDueDate("");
    setJiraKey("");
    setName("");
    setSummary("");
    setDosStatus("OPEN");
    setEntityType("requirement");
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    if (entityType === "requirement" && !title.trim()) {
      setError("Title is required");
      return;
    }
    if (entityType === "risk" && !name.trim()) {
      setError("Name is required");
      return;
    }
    if (!reqNumValid) {
      setError("Invalid requirement number format (e.g. ABC-123)");
      return;
    }
    if (!jiraKeyValid) {
      setError("Invalid Jira key format (e.g. ABC-123)");
      return;
    }
    setSubmitting(true);
    try {
      let headers: Record<string, string> = {};
      if (isAuthenticated) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE },
        });
        headers = { Authorization: `Bearer ${token}` };
      } else {
        await loginWithRedirect();
        return;
      }

      if (entityType === "requirement") {
        await axios.post("/api/requirements", {
          title,
          description,
          requirementNumber: requirementNumber || undefined,
          owner: owner || undefined,
          status: reqStatus,
          dueDate: dueDate || undefined,
          jiraKey: jiraKey || undefined,
        }, { headers });
      } else {
        await axios.post("/api/risks", {
          name,
          summary,
          status: dosStatus,
        }, { headers });
      }
      onCreated?.(entityType);
      resetFields();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  const renderBody = () => (
    <div style={{ display: "grid", gap: 12 }}>
      {error && (
        <SectionMessage appearance="error">{error}</SectionMessage>
      )}

            <div>
              <label htmlFor="entity-type" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Type</label>
              <select
                id="entity-type"
                name="entity-type"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as any)}
                style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {entityType === "requirement" ? (
              <>
                <TextField name="title" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder="Title" />
                <TextArea name="description" value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} placeholder="Description" />
                <TextField name="requirementNumber" value={requirementNumber} onChange={(e) => setRequirementNumber((e.target as HTMLInputElement).value)} onBlur={() => setRequirementNumber((v) => v.trim().toUpperCase())} placeholder="Requirement number (e.g. ABC-123)" isInvalid={!reqNumValid} />
                {!reqNumValid && requirementNumber.trim() !== "" && (
                  <div style={{ color: "#DE350B", fontSize: 12 }}>Invalid format. Use ABC-123.</div>
                )}
                <TextField name="jiraKey" value={jiraKey} onChange={(e) => setJiraKey((e.target as HTMLInputElement).value)} onBlur={() => setJiraKey((v) => v.trim().toUpperCase())} placeholder="Linked Jira Work Item (e.g. ABC-123)" isInvalid={!jiraKeyValid} />
                {!jiraKeyValid && jiraKey.trim() !== "" && (
                  <div style={{ color: "#DE350B", fontSize: 12 }}>Invalid Jira key. Use ABC-123.</div>
                )}
                <TextField name="owner" value={owner} onChange={(e) => setOwner((e.target as HTMLInputElement).value)} placeholder="Owner" />
                <div>
                  <label htmlFor="req-status" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Status</label>
                  <select id="req-status" name="req-status" value={reqStatus} onChange={(e) => setReqStatus(e.target.value as any)} style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}>
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
              </>
            ) : (
              <>
                <TextField name="name" value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="Name" />
                <TextArea name="summary" value={summary} onChange={(e) => setSummary((e.target as HTMLTextAreaElement).value)} placeholder="Summary" />
                <div>
                  <label htmlFor="dos-status" style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6B778C" }}>Status</label>
                  <select id="dos-status" name="dos-status" value={dosStatus} onChange={(e) => setDosStatus(e.target.value as any)} style={{ height: 36, border: "1px solid #EBECF0", borderRadius: 3, padding: "6px 8px", width: "100%" }}>
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
              </>
      )}
    </div>
  );

  return (
    <>
      {isOpen && forceSimple ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#FFFFFF", color: "#172B4D", borderRadius: 8, padding: 16, width: 560, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 600 }}>Create</div>
            {renderBody()}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Button appearance="subtle" onClick={() => { resetFields(); onClose(); }}>Cancel</Button>
              <Button appearance="primary" onClick={handleCreate} isDisabled={submitting || (entityType === "requirement" ? !title.trim() || !reqNumValid : !name.trim())}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ModalTransition>
          {isOpen ? (
            <Modal
              onClose={() => {
                resetFields();
                onClose();
              }}
            >
              <ModalHeader>
                <ModalTitle>Create</ModalTitle>
              </ModalHeader>
              <ModalBody>
                {renderBody()}
              </ModalBody>
              <ModalFooter>
                <Button appearance="subtle" onClick={() => { resetFields(); onClose(); }}>Cancel</Button>
                <Button appearance="primary" onClick={handleCreate} isDisabled={submitting || (entityType === "requirement" ? !title.trim() || !reqNumValid : !name.trim())}>
                  {submitting ? "Creating…" : "Create"}
                </Button>
              </ModalFooter>
            </Modal>
          ) : null}
        </ModalTransition>
      )}
    </>
  );
}


