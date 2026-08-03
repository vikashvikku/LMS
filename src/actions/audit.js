"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function getAuditLogs(params = {}) {
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  const { page = 1, limit = 20, module, action, sort = "newest" } = params;
  
  let query = supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      actor_id,
      actor:profiles!actor_id(first_name, last_name, role)
    `, { count: 'exact' })
    .eq("organization_id", profile.organization_id);

  if (module && module !== "all") {
    query = query.eq("entity_type", module);
  }
  if (action && action !== "all") {
    query = query.eq("action", action);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: true });
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Audit log error:", error);
    return { data: [], count: 0 };
  }

  return { data, count };
}

export async function getAuditStats() {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const [totalRes, todayRes, weekRes, criticalRes] = await Promise.all([
      supabase.from("audit_logs").select("id", { count: 'exact', head: true }).eq("organization_id", profile.organization_id),
      supabase.from("audit_logs").select("id", { count: 'exact', head: true }).eq("organization_id", profile.organization_id).gte("created_at", today.toISOString()),
      supabase.from("audit_logs").select("id", { count: 'exact', head: true }).eq("organization_id", profile.organization_id).gte("created_at", startOfWeek.toISOString()),
      supabase.from("audit_logs").select("id", { count: 'exact', head: true }).eq("organization_id", profile.organization_id).or("action.eq.DELETE,entity_type.eq.profiles")
    ]);

    return {
      total: totalRes.count || 0,
      today: todayRes.count || 0,
      week: weekRes.count || 0,
      critical: criticalRes.count || 0
    };
  } catch (error) {
    console.error("Audit stats error:", error);
    return { total: 0, today: 0, week: 0, critical: 0 };
  }
}
