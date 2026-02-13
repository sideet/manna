# GA4 Tracking Plan (Manna)

목표: **UX 최적화**를 위해 “어떤 페이지에서 얼마나 머무는지”, “어떤 기능을 가장 많이 사용하는지”, “공유가 코드 기반인지/공유하기 기반인지”를 GA4에서 일관된 이벤트로 수집한다.

---

## 구현 현황(코드 반영)

아래 항목들은 실제 코드에 반영되어 이벤트가 전송되도록 구현되어 있다.

- **GA 스니펫 로딩**: `src/app/layout.tsx`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` 값을 사용
  - 값이 없으면 GA 스크립트를 로드하지 않음
  - `gtag('config', ..., { send_page_view: false })`로 자동 page_view를 끄고, SPA 라우팅에 맞춰 수동 전송
- **SPA 라우트 변경 `page_view` 전송**: `src/components/analytics/GAPageView.tsx`
- **이벤트 전송 유틸**: `src/lib/analytics/ga.ts`
  - `trackEvent(eventName, params)`
  - `trackPageView({ url, pageGroup })`
  - `getPageGroup(pathname)`, `maskScheduleCode(code)`
- **공유(링크/네이티브 공유) 이벤트 계측**: `src/utils/shareLink.ts`
  - (단순화) **헤더 공유 CTA 클릭만 추적**: `cta_click (cta_name=header_share_link)`
- **일정 상세 “초대코드 복사” CTA 클릭 추적**: `src/components/features/schedule/components/ScheduleInfoCard.tsx`
  - `cta_click (cta_name=schedule_code_copy)`

---

## 원칙

- **페이지/체류시간**: GA4 기본 이벤트(`page_view`, `user_engagement`)를 활용한다.
- **기능 사용성**: 핵심 기능은 커스텀 이벤트로 정의하고, 공통 파라미터로 분류/필터링 가능하게 만든다.
- **공유 분석**: `open → select → complete` 3단계로 나눠 “열림 대비 완료율”, “방식별 선호도(코드 vs 공유하기)”를 측정한다.
- **개인정보/민감정보 금지**: 이메일/이름/전화번호/메시지 내용 등은 절대 전송하지 않는다.
- **식별자 취급**: `schedule_code`는 식별자 성격이 있어 정책에 따라 **해시/마스킹(권장)** 후 전송한다(예: 앞 2~3글자만, 또는 해시).

---

## 공통 파라미터(가능한 이벤트에 공통 적용)

- **`page_group`**: 페이지 묶음
  - 예: `home`, `create`, `schedule`, `confirmed`, `mypage`, `auth`
- **`entry_point`**: 유입/클릭 출처
  - 예: `create_success`, `schedule_header`, `confirmed`, `mypage`
- **`schedule_type`**: 일정 타입
  - 값: `individual` | `common`
- **`meeting_type`**: 미팅 타입
  - 값: `online` | `offline` | `none`
- (선택) **`schedule_code_masked`**: 마스킹/해시된 코드(정책 결정 후)

---

## 페이지/체류시간(기본 수집)

### 자동/기본 이벤트

- **`page_view`**: 페이지 뷰(기본)
- **`user_engagement`**: 체류/활성 시간(기본)
- (선택) **`scroll`**: 스크롤(Enhanced measurement 사용 시)

### 구현 메모(Next.js App Router)

- SPA 라우팅 특성상 **라우트 변경 시 `page_view`가 의도대로 기록되는지** 확인이 필요하다.
- 필요 시 라우트 변경 훅에서 `page_view`를 보강 전송한다.

---

## 커스텀 이벤트 정의(UX 최적화 핵심)

아래 이벤트들은 “퍼널/이탈 지점/사용 빈도” 분석을 목표로 한다.

### 1) 일정 생성 퍼널

- **`create_schedule_start`**

  - 언제: 생성 플로우 진입(첫 화면 도달)
  - params: `page_group`, `entry_point`

- **`create_schedule_step_view`**

  - 언제: 생성 단계(스텝) 화면 노출
  - params:
    - `step_name`: `type` | `time` | `participants` | `confirm` (프로덕트에 맞게 확정)
    - 공통 파라미터

- **`create_schedule_step_complete`**

  - 언제: 해당 스텝 완료(다음으로 이동)
  - params: `step_name`, 공통 파라미터

- **`create_schedule_submit`**

  - 언제: 생성 제출 클릭
  - params: 공통 파라미터

- **`create_schedule_success`**

  - 언제: 생성 성공(서버 응답 성공)
  - params:
    - `schedule_type`, `meeting_type`
    - 공통 파라미터

- **`create_schedule_fail`**
  - 언제: 생성 실패(서버/검증 오류)
  - params:
    - `fail_reason`: 짧은 코드(예: `validation`, `network`, `server_error`)
    - (선택) `http_status`
    - 공통 파라미터

### 2) 일정 참여/응답(가능 시간 제출)

- **`schedule_view`**

  - 언제: 일정 페이지 진입
  - params: `schedule_type`, `meeting_type`, (선택) `schedule_code_masked`, 공통 파라미터

- **`availability_submit`**

  - 언제: 가능한 시간 제출
  - params:
    - `selected_slots_count`: number
    - 공통 파라미터

- **`availability_edit`**
  - 언제: 제출 후 수정 저장/완료
  - params:
    - (선택) `delta_slots_count`: number
    - `selected_slots_count`: number
    - 공통 파라미터

### 3) 확정/관리 화면

- **`confirmed_view`**

  - 언제: 확정 페이지 진입
  - params: `schedule_type`, (선택) `schedule_code_masked`, 공통 파라미터

- **`confirm_action`**
  - 언제: 확정/관리에서 주요 액션 수행
  - params:
    - `action_name`: 예) `finalize`, `change_time`, `copy_info` (프로덕트에 맞게 확정)
    - 공통 파라미터

---

## 공유(코드 vs 공유하기) 측정

목표: “공유 UI는 열리는데 완료가 안 되는지”, “코드 공유가 더 많은지, 공유하기(링크/네이티브)가 더 많은지”를 비교한다.

> 현재 UX 목적(“두 버튼 중 뭐가 더 눌리는지”) 기준으로는 **공유 플로우 세부(오픈/완료/방식 선택)**까지 추적하지 않고,
> **CTA 클릭 2개만** 단일 이벤트로 비교한다.

- **`cta_click`**
  - 언제: 사용자가 주요 CTA 버튼을 클릭
  - params:
    - `cta_name`: `schedule_code_copy` | `header_share_link`
    - `page_group`
    - (선택) `entry_point`
    - (선택) `schedule_code_masked`

추천 지표:

- **“코드 vs 공유하기” 클릭 비교**: `cta_click`를 `cta_name`으로 분해
  - `schedule_code_copy`(초대코드 복사)
  - `header_share_link`(헤더 공유/링크복사)

---

## GA4 전환(Conversions) 추천

아래 이벤트를 전환으로 등록하면 “핵심 성공 경험” 위주로 대시보드가 깔끔해진다.

- **`create_schedule_success`**
- **`availability_submit`**
- (선택) **`cta_click`** (초기 UX 탐색 목적일 때만. 전환으로는 보통 `create_schedule_success`가 더 적합)

---

## 체크리스트(도입 후 검증)

- 라우트 이동 시 `page_view`가 페이지별로 정상 집계되는지 확인
- `cta_click` 이벤트가 `cta_name`별로 충분히 발생하는지 확인
- `schedule_code_masked` 등 식별자 파라미터가 **개인정보 정책에 부합**하는지 최종 확인
