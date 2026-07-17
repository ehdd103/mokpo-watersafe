"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Visit } from "@/types";

export async function syncConsentedVisit(visit: Visit) {
  if (!visit.consent) return { stored: false, reason: "consent-required" } as const;
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { stored: false, reason: "guest-mode" } as const;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { stored: false, reason: "not-authenticated" } as const;
  const { error } = await supabase.from("visit_histories").upsert({
    client_id: visit.id, user_id: user.id, region_code: visit.regionCode, note: visit.note,
    visit_start: visit.startDate, visit_end: visit.endDate, consented_at: new Date().toISOString(),
  }, { onConflict: "user_id,client_id" });
  if (error) throw error;
  return { stored: true } as const;
}

export async function deleteAuthenticatedVisit(clientId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("visit_histories").delete().eq("user_id", user.id).eq("client_id", clientId);
  if (error) throw error;
}

export async function clearAuthenticatedVisits() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("visit_histories").delete().eq("user_id", user.id);
  if (error) throw error;
}

export async function loadAuthenticatedVisits(): Promise<Visit[]> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("visit_histories").select("client_id,region_code,note,visit_start,visit_end,consented_at,created_at,mokpo_regions(name)").eq("user_id", user.id).order("visit_start", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.client_id, regionCode: row.region_code,
    regionName: Array.isArray(row.mokpo_regions) ? row.mokpo_regions[0]?.name ?? row.region_code : (row.mokpo_regions as { name?: string } | null)?.name ?? row.region_code,
    note: row.note, startDate: row.visit_start, endDate: row.visit_end, consent: Boolean(row.consented_at), createdAt: row.created_at,
  }));
}
