# 반응형 포트폴리오 웹사이트

미션 **「나를 소개하는 웹페이지 처음부터 만들기」**의 요구사항을 순수 HTML/CSS/JavaScript로 구현한 프로젝트입니다.

## 주요 기능

- 모바일 퍼스트 반응형 레이아웃
- 시맨틱 HTML 구조: `header`, `nav`, `main`, `section`, `article`, `footer`
- Flexbox 네비게이션 / CSS Grid 프로젝트 카드
- 모바일 햄버거 메뉴
- 부드러운 앵커 스크롤
- 스크롤 60px 이상: 헤더 배경 스타일 변경
- 스크롤 300px 이상: 맨 위로 이동 버튼 표시
- 다크 모드 토글 + `localStorage` 상태 유지
- 시스템 다크 모드(`prefers-color-scheme`) 초기 감지
- `IntersectionObserver` 스크롤 애니메이션 (`threshold: 0.2`)
- Contact 폼 필수값 / 이메일 형식 / 메시지 길이 검증
- GitHub REST API 연동 (`fetch`, `async/await`, `try/catch`)
- API 로딩 / 성공 / 에러 / 빈 상태 UI
- GitHub 프로젝트 언어별 필터링 (`filter`)
- Hero 타이핑 효과 (보너스)

## 폴더 구조

```text
portfolio_project/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ main.js
├─ images/
│  ├─ profile-photo.png
│  └─ profile.svg
└─ README.md
```

## 실행 방법

1. VS Code에서 프로젝트 폴더를 엽니다.
2. Live Server 확장을 설치합니다.
3. `index.html`을 우클릭 → **Open with Live Server**.

## 반드시 수정할 항목

### 1) GitHub 사용자명

`js/main.js` 상단의 값을 본인의 GitHub 아이디로 변경하세요.

```js
const GITHUB_USERNAME = 'octocat';
```

### 2) 이메일 / 소셜 링크

`index.html`의 아래 값을 본인 정보로 변경하세요.

- `hello@example.com`
- GitHub 링크
- LinkedIn 링크

### 3) 자기소개 문구

Hero, About, Skills 내용을 본인 경험에 맞게 자유롭게 수정할 수 있습니다.

## 상태 → 렌더링 흐름

1. **다크 모드**: 클릭 이벤트 → `state.theme` 변경 → `data-theme` 변경 → 전체 테마 렌더링
2. **GitHub API**: 요청 → `loading/success/error` 상태 변경 → Projects UI 렌더링
3. **폼 검증**: input/submit 이벤트 → `state.formErrors` 변경 → 필드별 오류 메시지 렌더링
4. **프로젝트 필터**: 필터 버튼 클릭 → `state.activeFilter` 변경 → `filter()` 결과 렌더링

## GitHub Pages 배포

1. GitHub에 새 저장소를 생성합니다.
2. 이 폴더의 파일을 저장소에 업로드/푸시합니다.
3. 저장소 → **Settings → Pages** 이동.
4. `Deploy from a branch` 선택.
5. Branch: `main`, Folder: `/ (root)` 선택 후 Save.
6. 생성된 URL을 아래에 기록합니다.

- GitHub 저장소 URL: https://github.com/kimstar5288-sys/AISW_mission_B1-1.git
- 배포 URL: https://portfolio-project-4.tiiny.site/

## 제출용 스크린샷

배포 후 다음 3장을 캡처해 README에 추가하세요.

- 데스크톱 화면
- 모바일 화면 (Chrome DevTools 권장)
- 다크 모드 화면

## 참고

GitHub API를 인증 없이 호출하면 시간당 요청 횟수 제한이 있습니다. 403 오류가 발생하면 사이트가 에러 상태와 재시도 버튼을 표시하도록 구현되어 있습니다.
