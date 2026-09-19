# GlassTalk Studio

AI 캐릭터 채팅에서 공유하고 싶은 장면을 깔끔한 카드로 만들어 **PNG / WEBP / PDF**로 저장하는 정적 웹앱입니다.

## 핵심 방향

- 회원가입/서버 없이 브라우저에서 동작
- 사용자가 입력한 채팅 내용과 업로드 이미지는 서버에 전송하지 않음
- iOS glass / liquid-glass 계열의 깨끗한 UI
- 라이트 모드 포인트: 하늘색
- 다크 모드 포인트: 차분한 골드
- GitHub Pages 배포 가능

## 기술 스택

- React
- Vite
- html-to-image
- jsPDF
- GitHub Actions + GitHub Pages

## 로컬 실행

Node.js 24 LTS 권장.

```bash
npm ci
npm run dev
```

브라우저에서 Vite가 안내하는 로컬 주소를 열면 됩니다.

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 현재 기능

- 라이트/다크 모드
- 제목 / 설명 / 캐릭터명 / 캐릭터 대사 / 사용자 대사 / 지문 입력
- 캐릭터 이미지 업로드
- 폰트 및 일부 레이아웃 설정
- 실시간 카드 미리보기
- PNG 저장
- WEBP 저장
- PDF 저장
- 모바일 반응형 UI

## GitHub Pages 배포

1. 새 GitHub 저장소를 만든다.
2. 이 폴더의 파일을 저장소에 push한다.
3. GitHub 저장소에서 **Settings → Pages**로 이동한다.
4. Build and deployment의 Source를 **GitHub Actions**로 선택한다.
5. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 배포한다.

## 권장 다음 작업

자세한 구현 우선순위와 디자인 규칙은 `CODEX.md` 참고.
