import { useEffect, useMemo, useRef, useState } from 'react'
import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const defaultMarkdown = `그는 한참 동안 아무 말도 하지 않았다.

창문 너머로 비가 내리고 있었다. 빗물이 유리창을 타고 길게 흘러내렸고, 방 안에는 작은 스탠드 조명만 켜져 있었다.

> “오늘은 가지 마.”

나는 고개를 들어 그를 바라봤다.

**평소와 같은 목소리였지만**, 이상하게도 그 말은 오래 남았다.

“왜?”

그는 잠시 웃었다.

---

## 늦은 밤

시간은 이미 자정을 넘기고 있었다.

그럼에도 아무도 먼저 자리에서 일어나지 않았다. 마치 먼저 움직이는 사람이 이 조용한 순간을 끝내 버리는 것처럼.

*그래서 나는 조금만 더 여기 있기로 했다.*`

const fontOptions = [
  {
    id: 'serif',
    name: '소설체',
    family: `"Noto Serif KR", "Nanum Myeongjo", "AppleMyungjo", Georgia, serif`,
  },
  {
    id: 'sans',
    name: '깔끔한 고딕',
    family: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`,
  },
  {
    id: 'system',
    name: '시스템',
    family: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", sans-serif`,
  },
]

const toolbarItems = [
  { label: 'H1', before: '# ', after: '', placeholder: '큰 제목' },
  { label: 'H2', before: '## ', after: '', placeholder: '소제목' },
  { label: 'B', before: '**', after: '**', placeholder: '굵은 글씨' },
  { label: 'I', before: '*', after: '*', placeholder: '기울임' },
  { label: '❝', before: '> ', after: '', placeholder: '인용문' },
  { label: '—', before: '\n---\n', after: '', placeholder: '' },
]

function App() {
  const previewRef = useRef(null)
  const textareaRef = useRef(null)

  const [theme, setTheme] = useState(() => localStorage.getItem('glass-theme') || 'light')
  const [title, setTitle] = useState(() => localStorage.getItem('glass-title') ?? '오늘의 기록')
  const [meta, setMeta] = useState(() => localStorage.getItem('glass-meta') ?? 'AI CHARACTER CHAT ARCHIVE')
  const [markdown, setMarkdown] = useState(() => localStorage.getItem('glass-markdown') ?? defaultMarkdown)
  const [fileName, setFileName] = useState('my-story')
  const [isExporting, setIsExporting] = useState(false)
  const [settings, setSettings] = useState({
    fontId: 'serif',
    fontSize: 17,
    lineHeight: 1.95,
    pageWidth: 720,
    sidePadding: 64,
    showTitle: true,
    showMeta: true,
  })

  const selectedFont = useMemo(
    () => fontOptions.find((font) => font.id === settings.fontId) || fontOptions[0],
    [settings.fontId],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('glass-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('glass-title', title)
    localStorage.setItem('glass-meta', meta)
    localStorage.setItem('glass-markdown', markdown)
  }, [title, meta, markdown])

  const updateSetting = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }))
  }

  const insertMarkdown = ({ before, after, placeholder }) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = markdown.slice(start, end)
    const inner = selected || placeholder
    const replacement = `${before}${inner}${after}`
    const next = `${markdown.slice(0, start)}${replacement}${markdown.slice(end)}`

    setMarkdown(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + replacement.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const safeFileName = () => {
    const raw = fileName.trim() || title.trim() || 'story'
    return raw.replace(/[\\/:*?"<>|]/g, '-').slice(0, 120)
  }

  const createCanvas = async () => {
    if (!previewRef.current) return null

    return toCanvas(previewRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      useCORS: true,
      backgroundColor: theme === 'dark' ? '#171615' : '#fffefc',
    })
  }

  const downloadDataUrl = (url, name) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  const runExport = async (callback) => {
    try {
      setIsExporting(true)
      await document.fonts?.ready
      await callback()
    } catch (error) {
      console.error(error)
      alert('저장 중 오류가 발생했어요. 글이 너무 길다면 내용을 조금 나눠서 다시 시도해 주세요.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportImage = (type) =>
    runExport(async () => {
      const canvas = await createCanvas()
      if (!canvas) return

      const mime = type === 'webp' ? 'image/webp' : 'image/png'
      const quality = type === 'webp' ? 0.94 : undefined
      downloadDataUrl(canvas.toDataURL(mime, quality), `${safeFileName()}.${type}`)
    })

  const exportPDF = () =>
    runExport(async () => {
      const canvas = await createCanvas()
      if (!canvas) return

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidthMm = 210
      const pageHeightMm = 297
      const pxPerMm = canvas.width / pageWidthMm
      const pageHeightPx = Math.floor(pageHeightMm * pxPerMm)
      const totalPages = Math.ceil(canvas.height / pageHeightPx)

      for (let page = 0; page < totalPages; page += 1) {
        const sourceY = page * pageHeightPx
        const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY)
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = pageHeightPx

        const context = pageCanvas.getContext('2d')
        context.fillStyle = theme === 'dark' ? '#171615' : '#fffefc'
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        )

        if (page > 0) pdf.addPage()
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageWidthMm, pageHeightMm)
      }

      pdf.save(`${safeFileName()}.pdf`)
    })

  const clearDocument = () => {
    if (!window.confirm('현재 글을 비울까요?')) return
    setTitle('')
    setMeta('')
    setMarkdown('')
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar glass">
        <div className="brand">
          <div className="brand-mark">G</div>
          <div>
            <strong>Glasscript</strong>
            <span>Markdown Story Studio</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button className="soft-button" type="button" onClick={clearDocument}>
            새 문서
          </button>
          <div className="theme-control" aria-label="테마 선택">
            <button
              className={theme === 'light' ? 'active' : ''}
              type="button"
              onClick={() => setTheme('light')}
              aria-label="라이트 모드"
            >
              ☀︎
            </button>
            <button
              className={theme === 'dark' ? 'active' : ''}
              type="button"
              onClick={() => setTheme('dark')}
              aria-label="다크 모드"
            >
              ☾
            </button>
          </div>
        </div>
      </header>

      <main className="workspace">
        <aside className="editor glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">WRITE</span>
              <h1>글 작성</h1>
            </div>
            <span className="save-state">자동 저장</span>
          </div>

          <div className="compact-fields">
            <label>
              <span>제목</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목" />
            </label>
            <label>
              <span>작은 표기</span>
              <input value={meta} onChange={(event) => setMeta(event.target.value)} placeholder="작품명 · 캐릭터명 · 날짜 등" />
            </label>
          </div>

          <div className="markdown-box">
            <div className="markdown-toolbar">
              {toolbarItems.map((item) => (
                <button key={item.label} type="button" onClick={() => insertMarkdown(item)} title={item.placeholder || '구분선'}>
                  {item.label}
                </button>
              ))}
            </div>
            <textarea
              aria-label="문서 내용"
              ref={textareaRef}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck="false"
              placeholder="여기에 글을 입력하세요. Markdown을 사용할 수 있어요."
            />
          </div>

          <details className="settings-card" open>
            <summary>조판 설정</summary>
            <div className="settings-content">
              <label className="setting-row">
                <span>본문 글꼴</span>
                <select value={settings.fontId} onChange={(event) => updateSetting('fontId', event.target.value)}>
                  {fontOptions.map((font) => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
              </label>

              <label className="slider-row">
                <div><span>글자 크기</span><b>{settings.fontSize}px</b></div>
                <input type="range" min="14" max="24" value={settings.fontSize} onChange={(event) => updateSetting('fontSize', Number(event.target.value))} />
              </label>

              <label className="slider-row">
                <div><span>줄 간격</span><b>{settings.lineHeight.toFixed(2)}</b></div>
                <input type="range" min="1.55" max="2.3" step="0.05" value={settings.lineHeight} onChange={(event) => updateSetting('lineHeight', Number(event.target.value))} />
              </label>

              <label className="slider-row">
                <div><span>본문 폭</span><b>{settings.pageWidth}px</b></div>
                <input type="range" min="560" max="860" step="10" value={settings.pageWidth} onChange={(event) => updateSetting('pageWidth', Number(event.target.value))} />
              </label>

              <label className="slider-row">
                <div><span>좌우 여백</span><b>{settings.sidePadding}px</b></div>
                <input type="range" min="32" max="100" step="4" value={settings.sidePadding} onChange={(event) => updateSetting('sidePadding', Number(event.target.value))} />
              </label>

              <div className="check-grid">
                <label><input type="checkbox" checked={settings.showTitle} onChange={(event) => updateSetting('showTitle', event.target.checked)} /> 제목 표시</label>
                <label><input type="checkbox" checked={settings.showMeta} onChange={(event) => updateSetting('showMeta', event.target.checked)} /> 작은 표기 표시</label>
              </div>
            </div>
          </details>

          <div className="export-card">
            <div className="export-head">
              <div>
                <span className="eyebrow">EXPORT</span>
                <h2>저장</h2>
              </div>
              {isExporting && <span className="exporting">변환 중…</span>}
            </div>

            <input className="filename" aria-label="파일명" value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="파일명" />

            <div className="export-buttons">
              <button type="button" disabled={isExporting} onClick={() => exportImage('png')}>PNG</button>
              <button type="button" disabled={isExporting} onClick={() => exportImage('webp')}>WEBP</button>
              <button className="primary" type="button" disabled={isExporting} onClick={exportPDF}>PDF</button>
            </div>
            <p>PNG·WEBP는 긴 글 전체를 하나의 세로 이미지로 저장하고, PDF는 A4 여러 페이지로 자동 분할합니다.</p>
          </div>
        </aside>

        <section className="preview-area">
          <div className="preview-label">
            <span>PREVIEW</span>
            <span>{markdown.length.toLocaleString()} chars</span>
          </div>

          <article
            ref={previewRef}
            className="story-page"
            style={{
              width: `${settings.pageWidth}px`,
              paddingLeft: `${settings.sidePadding}px`,
              paddingRight: `${settings.sidePadding}px`,
              '--body-size': `${settings.fontSize}px`,
              '--body-line': settings.lineHeight,
              '--story-font': selectedFont.family,
            }}
          >
            {(settings.showMeta || settings.showTitle) && (
              <header className="story-header">
                {settings.showMeta && meta && <div className="story-meta">{meta}</div>}
                {settings.showTitle && title && <h1>{title}</h1>}
              </header>
            )}

            <div className="markdown-render">
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {markdown || '*내용을 입력하면 여기에 표시됩니다.*'}
              </ReactMarkdown>
            </div>

            <footer className="story-footer">
              <span>✦</span>
            </footer>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
