import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-display text-6xl text-accent">404</p>
        <h1 className="display mt-4 text-3xl">Pagina nu există</h1>
        <Link href="/admin" className="btn btn-primary mt-6">
          Înapoi la panou
        </Link>
      </div>
    </main>
  );
}
