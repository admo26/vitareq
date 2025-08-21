"use client";
import { ReactNode } from "react";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        borderBottom: "1px solid #EBECF0",
      }}>
        <Link href="/" style={{ fontWeight: 600 }}>Vitareq</Link>
        <Link href="/requirements">Requirements</Link>
        <Link href="/dossiers">Dossiers</Link>
      </div>
      {children}
    </>
  );
}

export default AppShell;

