# 목포 워터세이프 (Mokpo WaterSafe)

목포시 수인성 질병 위험 대응 지도를 시연하는 Next.js 풀스택 해커톤 프로젝트입니다. 목포시 23개 행정동의 이름과 대략적인 중심 좌표만 지역 식별에 사용하며, 수질·감염병·확진·의심 사례·경보·의료기관 운영 정보는 전부 seed 기반 가상 또는 예시 데이터입니다.

> 본 서비스에 표시되는 수질 오염 및 감염병 정보는 해커톤 시연을 위해 생성된 가상 데이터이며, 실제 목포시의 수질 상태나 감염병 발생 현황과 무관합니다.

## 1. 서비스 아키텍처

```text
브라우저 (반응형/PWA)
  ├─ Next.js App Router UI
  ├─ AppStore: 시나리오·기준일·방문·알림 상태
  ├─ 지도 어댑터 ─ Kakao Maps / 중심좌표 기반 대체 지도
  └─ 게스트 방문 기록 ─ localStorage
             │ 명시적 저장 동의 + 로그인
             ▼
Next.js Proxy / Route Handler
  ├─ Supabase SSR 세션 갱신
  └─ 데모 접근 코드 검증·동일 출처 검사·rate limiting
             │
             ▼
Supabase PostgreSQL + Auth + RLS

Mock Providers → Service 계층 → 위험 계산/방문 매칭 → UI
```

- Next.js 16.2 App Router, React 19, TypeScript strict mode, Tailwind CSS 4, shadcn/ui 방식의 로컬 UI 컴포넌트를 사용합니다.
- 서버 컴포넌트를 기본으로 두고 지도·차트·폼·전역 데모 상태만 클라이언트 컴포넌트로 분리했습니다.
- `WaterQualityProvider`, `DiseaseCaseProvider`, `HealthAlertProvider`, `HealthcareFacilityProvider` 인터페이스와 Mock 구현을 분리했습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 `server-only` 모듈과 seed 스크립트에서만 사용합니다. 브라우저 번들에는 공개 URL과 anon key만 들어갑니다.
- Kakao 키가 없거나 로딩에 실패하면 사이트가 중단되지 않고 접근 가능한 행정동 중심좌표 대체 지도로 전환합니다.

## 2. 사용자 흐름

1. 홈에서 목포시 전체 가상 위험 요약과 7일 추세를 확인합니다.
2. 위험 지도에서 수질·감염병·경보·방문·의료기관 레이어를 독립적으로 켭니다.
3. 행정동을 선택해 점수, 산정 이유, 최신성, 누락 여부와 주변 예시 기관을 확인합니다.
4. 상세 주소나 GPS 경로 없이 행정동과 방문 날짜를 직접 등록합니다.
5. 방문 기간과 가상 경보 기간을 자동 비교해 겹침·사후 발표·신뢰도를 확인합니다.
6. 개인 위험 체크에서 일반 예방 행동과 119/응급실 안내를 확인합니다.
7. 예시 의료기관을 거리·유형·진료과목으로 찾고 일반 안전수칙을 확인합니다.
8. 관심 동과 방문 동의 가상 위험 변화 알림을 관리합니다.

방문 비교와 개인 체크 결과는 의료적 진단이나 전문 판단을 대신하지 않습니다.

## 3. 화면 구성

| 경로 | 화면 |
| --- | --- |
| `/` | 대시보드, 단계별 지역 수, 7일 추세, 지도 미리보기, 방문 비교 |
| `/map` | 목포시 지도/목록, 날짜 범위·행정동·질병·단계 필터, 독립 레이어 |
| `/regions/[code]` | 행정동 위험·수질·사례·최신성·7일 차트 상세 |
| `/visits` | 방문 CRUD, 자동 위험 비교, CSV/JSON, 전체 삭제, 보관 기간 |
| `/risk-check` | 최소 건강 체크와 일반 행동요령 |
| `/safety` | 13개 예방수칙 카드 |
| `/facilities` | 가상 병원·의원·응급실·보건소 목록/지도 |
| `/notifications` | 8종 알림과 종류별 수신 설정, 명시적 브라우저 권한 |
| `/data` | 가상 데이터·위험 점수·공급자 구조 설명 |
| `/privacy` | 최소 수집, 동의, 삭제, RLS 안내 |
| `/admin` | 접근 코드로 보호한 시나리오·seed·시간 이동·발표 모드 |
| `/login` | Supabase 로그인·회원가입, 미설정 시 게스트 안내 |

404, 로딩 스켈레톤, 라우트 오류 경계, 빈 상태와 재시도/대체 UI도 포함합니다. 관리자 링크는 일반 내비게이션에 표시하지 않습니다.

## 4. 데이터 구조

핵심 레코드는 `src/types/index.ts`의 `MockRiskRecord`입니다. 모든 생성 레코드에는 `isMock: true`, `scenarioId`, 행정동 집계, 관측·게시·만료 시각, 신뢰도와 누락 상태가 포함됩니다. 개인 이름·성별·나이·전화번호·상세주소·이동경로는 생성하지 않습니다.

`npm run mock:generate` 결과:

```text
data/mock/
  regions.json
  water-quality.json
  disease-cases.json
  health-alerts.json
  healthcare-facilities.json
  visit-history.json
  scenarios.json
  region-adjacency.json
```

지도 원과 폴리곤 대체 영역은 공식 경계가 아닌 행정동 중심 좌표 기반 예시입니다. 코드 주석, 데이터의 `boundaryType`, 지도 안내와 이 문서에 같은 사실을 표시합니다.

## 5. 위험도 계산 방식

`src/features/risk/calculate-risk.ts`가 다음 요소를 독립적으로 가중 합산하고 0~100으로 제한합니다.

- 최근 가상 확진 집계와 증가율
- 가상 의심 사례
- 가상 수질 측정값의 시연 기준 초과
- 인접 행정동 주의·경계 단계
- 활성 가상 경보
- 데이터 최신성 및 필수 데이터 누락

| 점수 | 단계 |
| --- | --- |
| 0~19 | 정상 |
| 20~39 | 관심 |
| 40~69 | 주의 |
| 70~100 | 경계 |
| 필수 데이터 누락 | 정보 없음 또는 낮은 신뢰도 |

수질 이상만으로 감염병 확산을 단정하지 않습니다. 결과에는 점수뿐 아니라 사람이 확인할 수 있는 `reasons`, `confidence`, `missingData`, `calculatedAt`이 함께 반환됩니다.

## 6. 폴더 구조

```text
src/
  app/                         # App Router 페이지, manifest, API
  components/
    admin/ auth/ common/ dashboard/ hospitals/
    layout/ map/ notifications/ providers/ risk/ ui/ visits/
  config/                      # 목포 지역, 위험 기준, 15개 시나리오
  data/                        # 안전수칙과 예시 의료기관
  features/
    risk/ simulation/ visits/  # 순수 도메인 로직
  lib/supabase/                # browser/server/admin 키 경계
  providers/mock/              # Mock provider 구현
  services/                    # UI와 provider/저장소 사이 계층
  types/
scripts/mock-data.ts
supabase/migrations/
data/mock/
public/                        # PWA 아이콘·서비스 워커
tests/unit/ integration/ e2e/
```

## 7. 데이터베이스 스키마

`supabase/migrations/202607160001_initial_schema.sql`에 다음 테이블, 외래키, 인덱스, `updated_at` 트리거와 RLS 정책이 있습니다.

`profiles`, `mokpo_regions`, `mock_water_quality_records`, `mock_disease_case_records`, `mock_health_alerts`, `mock_healthcare_facilities`, `visit_histories`, `favorite_regions`, `notification_preferences`, `notifications`, `safety_guides`, `mock_scenarios`, `simulation_settings`, `data_sync_logs`.

- `visit_histories`, `favorite_regions`, `notification_preferences`, `notifications`는 `auth.uid() = user_id`인 본인만 CRUD할 수 있습니다.
- 일반 관리자 정책으로 개인 방문 기록을 열어주지 않습니다. 서비스 역할은 seed/운영 작업 전용이며 관리자 UI에서 사용하지 않습니다.
- 공개 읽기 정책은 `is_mock = true`인 가상 집계 테이블과 안전수칙/지역에만 적용합니다.
- 방문 메모는 100자, 행정동 외래키, 방문 날짜 순서, 보관 기간 범위를 DB에서도 검증합니다.

## 8. 파일별 실제 코드

모든 코드는 이 저장소에 실행 가능한 형태로 포함되어 있으며 의사코드나 생략 파일이 없습니다. 주요 진입점은 다음과 같습니다.

- 앱 루트: `src/app/layout.tsx`, `src/app/page.tsx`
- 전역 시나리오: `src/components/providers/app-store.tsx`
- 지도 어댑터: `src/components/map/map-adapter.ts`, `src/components/map/kakao-map.tsx`
- 규칙 기반 생성기: `src/features/simulation/generate.ts`
- 위험 계산: `src/features/risk/calculate-risk.ts`
- 방문 매칭: `src/features/visits/match-visits.ts`
- 공급자 계약/Mock: `src/providers/contracts.ts`, `src/providers/mock/index.ts`
- 인증 세션: `src/proxy.ts`, `src/lib/supabase/*`
- 보안 처리된 데모 인증: `src/app/api/demo/auth/route.ts`

## 9. 테스트 코드

```bash
npm test              # Vitest 단위 + 통합
npm run test:e2e      # Playwright E2E
npm run lint
npm run build
```

단위 테스트는 위험 계산, 방문/경보 기간 겹침, 시나리오 생성, seed 재현성, 누락과 오래된 데이터 판정을 다룹니다. 통합 테스트는 방문 등록·삭제, 시나리오 전역 변경, 지도 필터, 알림 생성, 로그인 사용자 동의 저장을 다룹니다. E2E는 상동 방문 등록 → 관리자 가상 경보 → 사용자 알림 → 상동 상세 → 안전수칙 → 의료기관 순서를 실행합니다.

최초 E2E 실행 전 브라우저가 없다면 `npx playwright install chromium`을 한 번 실행하세요.

## 10. 실행 및 Vercel 배포

### 로컬 설치와 실행

```bash
npm install
Copy-Item .env.example .env.local   # PowerShell
npm run mock:generate
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Kakao/Supabase 변수가 없어도 Mock JSON, 대체 지도, 게스트 localStorage 흐름으로 실행됩니다.

### 가상 데이터 명령

```bash
npm run mock:generate
npm run mock:reset
npm run mock:seed
npm run mock:scenario -- gradual-spread 2026-07-17 my-seed
```

- `mock:generate`: 기본 시나리오 8개 JSON 생성
- `mock:reset`: 안전한 작업공간 경로 확인 후 `all-normal` 데이터로 초기화
- `mock:seed`: JSON 생성 후 Supabase 서버 변수가 있으면 DB에 upsert
- `mock:scenario`: `시나리오 ID`, `기준일`, `seed` 순으로 지정
- 같은 seed·시나리오·날짜·설정은 같은 결과를 만듭니다.

15개 시나리오는 전체 정상, 수질 이상, 단일 발생, 인접 확산, 동시 발생, 경보 상승/하락/해제, 누락, 오래됨, 기관 결과 없음, 위치 거부, 방문 지역 새 경보, 공급자 오류, 오프라인입니다.

### Supabase 설정과 migration

1. Supabase 프로젝트를 만들고 Project URL, anon key, service role key를 확인합니다.
2. `.env.local`에 URL/키를 설정합니다. service role은 로컬 비밀 또는 Vercel 서버 환경변수로만 둡니다.
3. Supabase CLI로 연결한 뒤 migration을 적용합니다.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npm run mock:seed
```

Auth의 Email provider와 Site URL/Redirect URL을 로컬 및 Vercel 도메인에 맞게 설정합니다. RLS가 활성화되지 않은 상태로 배포하지 마세요.

### Kakao Maps 설정

1. Kakao Developers에서 JavaScript 앱 키를 만듭니다.
2. Web 플랫폼 도메인에 `http://localhost:3000`과 실제 Vercel 도메인을 등록합니다.
3. `NEXT_PUBLIC_KAKAO_MAP_KEY`에 JavaScript 키를 넣습니다. REST API 키나 Admin 키를 넣지 않습니다.
4. 키가 잘못되었거나 네트워크가 끊겨도 중심좌표 기반 대체 지도가 표시되는지 확인합니다.

### 관리자 데모와 발표 순서

`.env.local`의 `DEMO_ACCESS_CODE`를 설정하고 `/admin`으로 직접 이동합니다. 기본 개발 코드 `watersafe-demo`는 공개 배포 전에 반드시 변경하세요.

1. `gradual-spread`와 발표용 seed를 선택합니다.
2. 상동 방문 예시를 생성합니다.
3. `방문 지역 경보 생성`을 눌러 알림과 매칭을 확인합니다.
4. 하루/7일 이동 또는 자동 재생으로 확산을 보여줍니다.
5. 수질 이상·누락·오래된 데이터 시나리오로 신뢰도 UI를 보여줍니다.
6. 전체 화면 발표 모드에서 지도, 현재 위험 지역, 가상 확진, 타임라인, 방문 알림, 가까운 기관을 보여줍니다.

### Vercel 배포

1. 저장소를 GitHub에 올리고 Vercel에서 Import합니다.
2. Framework Preset은 Next.js, Build Command는 `npm run build`를 사용합니다.
3. `.env.example`의 변수를 Preview/Production 환경에 각각 등록합니다.
4. Kakao Web 플랫폼에 최종 Vercel 도메인을 추가합니다.
5. Supabase Auth Redirect URL에 최종 도메인을 추가합니다.
6. Preview에서 `npm test`, 프로덕션 빌드, 로그인/RLS, 지도 실패 대체 UI, 모바일 설치를 확인한 뒤 승격합니다.

## 개인정보·보안 주의사항

- 상세 위치/GPS 경로를 자동 수집하지 않으며 공개 지도에 개인 방문을 노출하지 않습니다.
- 게스트 기록은 localStorage에만 있고 내보내기·개별/전체 삭제·보관 기간을 제공합니다.
- 로그인 기록은 동의한 경우에만 사용자 ID 범위로 동기화합니다.
- 건강 체크의 세부 질환명은 받지 않으며 서버 저장을 기본으로 하지 않습니다.
- Zod 입력 검증, Supabase 파라미터화 쿼리, RLS, SameSite/HttpOnly 데모 쿠키, 동일 출처 검사, rate limiting, 보안 응답 헤더를 사용합니다.
- 실제 운영 전 CSP nonce 정책, 감사 로그 비식별화, 보관 만료 배치, 침투 테스트와 법률 검토를 추가해야 합니다.

## 향후 실제 데이터로 교체

실제 데이터 도입은 UI를 수정하는 대신 `src/providers/contracts.ts`의 각 인터페이스 구현을 추가하고 서비스 조립부에서 Mock 구현을 교체합니다. 이때 데이터 출처·갱신 주기·라이선스·품질·누락 정의를 명시하고, 실제/가상 레코드가 섞이지 않도록 `isMock` 표시와 환경을 분리해야 합니다. 실제 데이터 검증과 관계기관 승인 전에는 현재의 가상 데이터 안내 배지를 제거하지 마세요.
