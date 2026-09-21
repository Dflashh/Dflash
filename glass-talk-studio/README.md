# Glasscript — Markdown Story Studio

AI 캐릭터 채팅에서 공유하고 싶은 장면, 대사, 지문 등을 **소설/문서처럼 하나의 긴 페이지로 조판**하고 PNG, WEBP, PDF로 저장하는 브라우저 기반 도구입니다.

## 핵심 기능

- 긴 글을 하나의 연속된 문서로 실시간 미리보기
- Markdown 렌더링
  - 제목 (`#`, `##`, `###`)
  - 굵게 / 기울임
  - 인용문
  - 구분선
  - 목록
  - 표, 체크리스트 등 GFM 문법
- iOS glass 스타일 UI
- Light: sky blue accent
- Dark: champagne gold accent
- 본문 글꼴 / 크기 / 줄 간격 / 폭 / 여백 조절
- PNG / WEBP: 전체 문서를 긴 세로 이미지로 저장
- PDF: A4 여러 페이지 자동 분할
- 작성 내용은 브라우저 localStorage에 자동 저장
- 별도 서버 없이 GitHub Pages에서 동작

## 로컬 실행

Node.js 24 LTS를 사용합니다.

```bash
npm ci
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

## GitHub Pages

이 앱은 `Dflashh/Dflash` 저장소의 일부입니다. 저장소 루트의
`.github/workflows/deploy.yml`이 `main` 변경 시 빌드하고 자동 배포합니다.
앱 폴더 안의 workflow는 단독 배포 참고용이며 이 저장소에서는 실행되지 않습니다.

공개 주소: https://dflashh.github.io/Dflash/glass-talk/

## 보안 / 개인정보

입력한 텍스트는 외부 서버로 전송하지 않습니다. 현재 자동 저장은 사용자의 브라우저 localStorage에서만 이루어집니다.

## 참고

브라우저는 초대형 Canvas 크기에 제한이 있으므로 수만 픽셀을 넘어가는 매우 긴 문서는 PNG/WEBP 저장이 제한될 수 있습니다. PDF는 A4 페이지로 분할되지만, 렌더링용 원본 캔버스가 브라우저 한도를 넘는 극단적으로 긴 문서는 이후 chunk export 방식으로 개선할 수 있습니다.
