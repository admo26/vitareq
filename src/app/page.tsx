import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Welcome to Vitafleet Vitareq</h2>
      <div style={{ marginTop: 12 }}>
        Go to <Link href="/requirements">Requirements</Link> or <Link href="/dossiers">Dossiers</Link>.
      </div>
    </div>
  );
}
