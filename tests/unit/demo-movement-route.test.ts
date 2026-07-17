import { describe, expect, it } from "vitest";
import { REGIONS } from "@/config/regions";
import { createDemoMovementRoute } from "@/data/demo-movement-route";

function sequenceRandom(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe("랜덤 가상 이동 동선", () => {
  it("서로 다른 행정동 4~6곳을 시간순으로 만든다", () => {
    const route = createDemoMovementRoute("2026-07-17", sequenceRandom([0.4, 0.1, 0.7, 0.3, 0.9, 0.2]));

    expect(route.length).toBeGreaterThanOrEqual(4);
    expect(route.length).toBeLessThanOrEqual(6);
    expect(new Set(route.map((visit) => visit.regionCode)).size).toBe(route.length);
    expect(route.every((visit) => REGIONS.some((region) => region.code === visit.regionCode))).toBe(true);
    expect(route.every((visit) => visit.startDate === "2026-07-17" && visit.isMock)).toBe(true);
    expect(route.map((visit) => visit.sequence)).toEqual(route.map((_, index) => index + 1));
    expect(route.every((visit, index) => index === 0 || route[index - 1].endTime! < visit.startTime!)).toBe(true);
  });

  it("난수 값이 달라지면 다른 이동 경로를 만든다", () => {
    const first = createDemoMovementRoute("2026-07-17", sequenceRandom([0.05, 0.1, 0.2, 0.3, 0.4]));
    const second = createDemoMovementRoute("2026-07-17", sequenceRandom([0.95, 0.9, 0.8, 0.7, 0.6]));

    expect(second.map((visit) => visit.regionCode)).not.toEqual(first.map((visit) => visit.regionCode));
    expect(second.map((visit) => visit.startTime)).not.toEqual(first.map((visit) => visit.startTime));
  });
});
