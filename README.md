# Dflash

Dflash의 웹사이트 모음. 하나의 GitHub Pages 배포에서 사이트별 경로를 사용합니다.

- 메인: https://dflashh.github.io/Dflash/
- GlassTalk Studio: https://dflashh.github.io/Dflash/glass-talk/

## 개발

Node.js 24에서 `glass-talk-studio` 폴더로 이동한 뒤 `npm ci`, `npm run dev`를 실행합니다.
프로덕션 빌드는 `npm run build`입니다.

## 배포

저장소 Settings → Pages → Source를 GitHub Actions로 설정합니다.
`main` 브랜치에 push하면 루트의 `.github/workflows/deploy.yml`이 모든 사이트를 빌드하고 배포합니다.
앱 폴더 안의 workflow는 원본 단독 배포 참고용이며 이 저장소에서는 실행되지 않습니다.

새 사이트를 추가할 때 앱 폴더를 만들고 루트 workflow에서 해당 빌드 결과를 `_site/사이트이름/`에 복사한 뒤 메인 `index.html`에 링크를 추가합니다.
