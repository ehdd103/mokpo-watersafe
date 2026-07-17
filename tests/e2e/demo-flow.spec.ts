import { expect, test } from "@playwright/test";

test("상동 방문 이후 가상 경보·상세·안전수칙·병원을 확인한다",async({page})=>{
  await page.goto("/visits");
  await page.getByLabel("방문 행정동").selectOption({label:"상동"});
  await page.getByLabel("방문 장소 메모 (선택)").fill("발표용 방문");
  await page.getByLabel("시작일").fill("2026-07-12");
  await page.getByLabel("종료일").fill("2026-07-12");
  await page.getByLabel(/이 브라우저에 행정동/).check();
  await page.getByRole("button",{name:"방문 이력 저장"}).click();
  await expect(page.getByRole("heading",{name:"상동"})).toBeVisible();

  await page.goto("/admin");
  await page.getByPlaceholder("접근 코드").fill("watersafe-demo");
  await page.getByRole("button",{name:"확인"}).click();
  await page.getByRole("button",{name:"방문 지역 경보 생성"}).click();
  await page.goto("/notifications");
  await expect(page.getByText(/상동 가상 위험도 상승/).first()).toBeVisible();
  await page.getByText(/상동 가상 위험도 상승/).first().click().catch(()=>undefined);
  await page.goto("/regions/46110756");
  await expect(page.getByRole("heading",{name:"상동 상세"})).toBeVisible();
  await page.goto("/safety");
  await expect(page.getByRole("heading",{name:"일반 안전수칙"})).toBeVisible();
  await page.goto("/facilities");
  await expect(page.getByRole("heading",{name:"주변 의료기관 찾기"})).toBeVisible();
});
