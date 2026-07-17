import { describe, expect, it } from "vitest";
import { HEALTHCARE_FACILITIES } from "@/data/facilities";

describe("목포시 실제 병원 데이터", () => {
  it("공식 목록 42곳을 중복 없이 제공한다", () => {
    expect(HEALTHCARE_FACILITIES).toHaveLength(42);
    expect(new Set(HEALTHCARE_FACILITIES.map((item) => item.id)).size).toBe(42);
    expect(new Set(HEALTHCARE_FACILITIES.map((item) => item.name)).size).toBe(42);
  });

  it("모든 기관에 실제 연락 정보와 유효한 대표 좌표가 있다", () => {
    HEALTHCARE_FACILITIES.forEach((item) => {
      expect(item.isMock).toBe(false);
      expect(item.address).toContain("목포시");
      expect(item.phone).toMatch(/^061-/);
      expect(item.latitude).toBeGreaterThan(34.7);
      expect(item.latitude).toBeLessThan(34.9);
      expect(item.longitude).toBeGreaterThan(126.3);
      expect(item.longitude).toBeLessThan(126.5);
    });
  });
});
