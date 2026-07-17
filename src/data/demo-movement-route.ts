import { REGIONS } from "@/config/regions";
import type { Visit } from "@/types";

type RandomSource = () => number;

const MIN_STOPS = 4;
const MAX_STOPS = 6;
const DAY_START_MINUTES = 7 * 60;
const DAY_START_RANGE_MINUTES = 120;

function randomInt(min: number, max: number, random: RandomSource) {
  const value = Math.min(Math.max(random(), 0), 0.999999999);
  return min + Math.floor(value * (max - min + 1));
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function createRouteId(random: RandomSource) {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.floor(random() * 1_000_000_000)}`;
}

export function createDemoMovementRoute(date: string, random: RandomSource = Math.random): Visit[] {
  const availableRegions = [...REGIONS];
  const stopCount = randomInt(MIN_STOPS, MAX_STOPS, random);
  const selectedRegions = Array.from({ length: stopCount }, () => {
    const index = randomInt(0, availableRegions.length - 1, random);
    return availableRegions.splice(index, 1)[0];
  });
  const routeId = createRouteId(random);
  let cursor = DAY_START_MINUTES + randomInt(0, DAY_START_RANGE_MINUTES, random);

  return selectedRegions.map((region, index) => {
    const startTime = formatTime(cursor);
    const endMinutes = cursor + randomInt(35, 75, random);
    const endTime = formatTime(endMinutes);
    const label = index === 0 ? "출발" : index === selectedRegions.length - 1 ? "도착" : "경유";
    cursor = endMinutes + randomInt(15, 35, random);

    return {
      id: `demo-route-${date}-${routeId}-${index + 1}`,
      regionCode: region.code,
      regionName: region.name,
      note: `가상 ${label} · ${region.name} 생활권`,
      startDate: date,
      endDate: date,
      startTime,
      endTime,
      sequence: index + 1,
      consent: false,
      createdAt: `${date}T${startTime}:00+09:00`,
      isMock: true,
    };
  });
}
