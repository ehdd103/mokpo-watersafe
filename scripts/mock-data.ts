import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { REGIONS, REGION_ADJACENCY } from "../src/config/regions";
import { SCENARIOS } from "../src/config/scenarios";
import { HEALTHCARE_FACILITIES } from "../src/data/facilities";
import { createDemoMovementRoute } from "../src/data/demo-movement-route";
import { generateRecords } from "../src/features/simulation/generate";

const root = path.resolve(process.cwd(), "data/mock");
const command = process.argv[2] ?? "generate";
const scenarioId = process.argv[3] ?? "gradual-spread";
const date = process.argv[4] ?? "2026-07-16";
const seed = process.argv[5] ?? process.env.MOCK_DATA_SEED ?? "mokpo-watersafe-2026";

async function writeJson(name: string, data: unknown) { await writeFile(path.join(root, name), `${JSON.stringify(data, null, 2)}\n`, "utf8"); }
async function generate(selectedScenario = scenarioId) {
  const scenario = SCENARIOS.find((item) => item.id === selectedScenario) ?? SCENARIOS[3];
  const records = generateRecords(scenario, date, { seed });
  const alerts = records.filter((item) => item.riskLevel === "caution" || item.riskLevel === "warning").map((item) => ({ id: `alert-${item.id}`, regionCode: item.regionCode, regionName: item.regionName, level: item.riskLevel, title: `${item.regionName} 가상 경보`, description: item.reasons[0], startsAt: item.observedAt, endsAt: item.expiresAt, publishedAt: item.publishedAt, active: true, isMock: true }));
  await mkdir(root, { recursive: true });
  await Promise.all([
    writeJson("regions.json", REGIONS.map((region) => ({ ...region, isMock: true, boundaryType: "approximate-center" }))),
    writeJson("water-quality.json", records), writeJson("disease-cases.json", records), writeJson("health-alerts.json", alerts),
    writeJson("healthcare-facilities.json", scenario.flags?.noFacilities ? [] : HEALTHCARE_FACILITIES),
    writeJson("visit-history.json", createDemoMovementRoute(date)),
    writeJson("scenarios.json", SCENARIOS.map((item) => ({ ...item, isMock: true }))), writeJson("region-adjacency.json", REGION_ADJACENCY),
  ]);
  console.log(`Generated 8 mock files: scenario=${scenario.id}, date=${date}, seed=${seed}`);
  return { records, alerts, scenario };
}

async function seedDatabase() {
  const { records, alerts } = await generate(); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.log("Supabase variables are not set; JSON generation completed and database seeding was skipped."); return; }
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const run = async (table: string, rows: object[], onConflict: string) => { const { error } = await supabase.from(table).upsert(rows, { onConflict }); if (error) throw error; };
  await run("mock_scenarios", SCENARIOS.map((item) => ({ id: item.id, name: item.name, description: item.description, seed: item.seed, settings: item.flags ?? {}, is_mock: true })), "id");
  await run("mokpo_regions", REGIONS.map((item) => ({ code: item.code, slug: item.slug, name: item.name, latitude: item.latitude, longitude: item.longitude, boundary_is_approximate: true })), "code");
  await run("mock_water_quality_records", records.map((item) => ({ external_id: item.id, region_code: item.regionCode, risk_level: item.riskLevel, risk_score: item.riskScore, water_quality_status: item.waterQualityStatus, pollutant_type: item.pollutantType, measured_value: item.measuredValue, threshold_value: item.thresholdValue, observed_at: item.observedAt, published_at: item.publishedAt, expires_at: item.expiresAt, reasons: item.reasons, confidence: item.confidence, missing_data: item.missingData, is_mock: true, scenario_id: item.scenarioId })), "external_id");
  await run("mock_disease_case_records", records.map((item) => ({ external_id: item.id, region_code: item.regionCode, risk_level: item.riskLevel, risk_score: item.riskScore, disease_type: item.diseaseType, confirmed_case_count: item.confirmedCaseCount, suspected_case_count: item.suspectedCaseCount, water_quality_status: item.waterQualityStatus, pollutant_type: item.pollutantType, measured_value: item.measuredValue, threshold_value: item.thresholdValue, observed_at: item.observedAt, published_at: item.publishedAt, expires_at: item.expiresAt, reasons: item.reasons, confidence: item.confidence, missing_data: item.missingData, is_mock: true, scenario_id: item.scenarioId })), "external_id");
  await run("mock_health_alerts", alerts.map((item) => ({ external_id: item.id, region_code: item.regionCode, title: item.title, description: item.description, risk_level: item.level, starts_at: item.startsAt, ends_at: item.endsAt, published_at: item.publishedAt, active: item.active, is_mock: true })), "external_id");
  await run("mock_healthcare_facilities", HEALTHCARE_FACILITIES.map((item) => ({ external_id: item.id, region_code: item.regionCode, name: item.name, facility_type: item.type, address: item.address, phone: item.phone, latitude: item.latitude, longitude: item.longitude, departments: item.departments, hours: item.hours, emergency: item.emergency, is_mock: false })), "external_id");
  console.log("Supabase mock seed completed.");
}

async function main() {
  if (command === "reset") { const resolved = path.resolve(root); const workspace = path.resolve(process.cwd()); if (!resolved.startsWith(workspace + path.sep)) throw new Error("Refusing to reset outside workspace"); await rm(resolved, { recursive: true, force: true }); await generate("all-normal"); console.log("Mock data reset to all-normal."); return; }
  if (command === "seed") { await seedDatabase(); return; }
  if (command === "scenario") { await generate(scenarioId); return; }
  await generate();
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
