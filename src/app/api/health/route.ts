import { isSupabaseConfigured } from "@/lib/env";
import { publicClient } from "@/server/supabase/clients";

export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe used by the post-deployment smoke test.
 * Reports only coarse status — never versions, keys or internal errors.
 */
export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (isSupabaseConfigured()) {
    try {
      const { error } = await publicClient().from("cv_sections").select("key", { head: true, count: "exact" });
      database = error ? "error" : "ok";
    } catch {
      database = "error";
    }
  }
  const status = database === "error" ? 503 : 200;
  return Response.json(
    { status: status === 200 ? "ok" : "degraded", database, time: new Date().toISOString() },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
