import { useEffect, useRef, useState } from 'react'
import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'

const initialForm = {
  title: '오늘의 대화',
  subtitle: 'AI 채팅 공유 카드',
  characterName: '루카',
  characterLine: '오늘은 조금 더 옆에 있어 줄래?',
  myLine: '응. 오늘은 천천히 이야기하자.',
  narration: '창가로 스며든 저녁빛 속에서, 우리는 잠시 아무 말도 하지 않았다.',
  footer: '@my_archive',
  fileName: 'chat-card',
}

const fontOptions = [
  {
    label: '기본',
    value: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Segoe UI", sans-serif`,
  },
  {
    label: '고딕 느낌',
    value: `"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`,
  },
  {
    label: '세련된 느낌',
    value: `"Avenir Next", "Segoe UI", "Apple SD Gothic Neo", sans-serif`,
  },
]

function App() {
  const previewRef = useRef(null)
  const [theme, setTheme] = useState('light')
  const [form, setForm] = useState(initialForm)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [styleOptions, setStyleOptions] = useState({
    fontFamily: fontOptions[0].value,
    fontSize: 18,
    titleSize: 28,
    radius: 30,
    padding: 28,
    showFooter: true,
    showSubtitle: true,
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleStyleChange = (key, value) => {
    setStyleOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const getSafeFileName = () => {
    const raw = form.fileName?.trim() || 'chat-card'
    return raw.replace(/[\\/:*?"<>|]/g, '-')
  }

  const makeCanvas = async () => {
    if (!previewRef.current) return null

    return toCanvas(previewRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      useCORS: true,
    })
  }

  const downloadDataUrl = (dataUrl, filename) => {
    const anchor = document.createElement('a')
    anchor.href = dataUrl
    anchor.download = filename
    anchor.click()
  }

  const withExport = async (fn) => {
    try {
      setIsExporting(true)
      await fn()
    } catch (error) {
      console.error(error)
      alert('내보내기 중 오류가 발생했어요.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportPNG = () =>
    withExport(async () => {
      const canvas = await makeCanvas()
      if (!canvas) return
      downloadDataUrl(canvas.toDataURL('image/png'), `${getSafeFileName()}.png`)
    })

  const exportWEBP = () =>
    withExport(async () => {
      const canvas = await makeCanvas()
      if (!canvas) return
      downloadDataUrl(canvas.toDataURL('image/webp', 0.95), `${getSafeFileName()}.webp`)
    })

  const exportPDF = () =>
    withExport(async () => {
      const canvas = await makeCanvas()
      if (!canvas) return

      const imgData = canvas.toDataURL('image/png')
      const exportWidth = 900
      const exportHeight = (canvas.height * exportWidth) / canvas.width
      const pdf = new jsPDF({
        orientation: exportWidth > exportHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [exportWidth, exportHeight],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, exportWidth, exportHeight)
      pdf.save(`${getSafeFileName()}.pdf`)
    })

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <header className="topbar glass-panel">
        <div>
          <div className="brand-kicker">Shareable AI chat cards</div>
          <h1 className="brand-title">GlassTalk Studio</h1>
        </div>

        <div className="theme-switch" aria-label="테마 선택">
          <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} type="button">라이트</button>
          <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} type="button">다크</button>
        </div>
      </header>

      <main className="main-grid">
        <section className="editor-panel glass-panel">
          <div className="section-header">
            <h2>내용</h2>
            <span className="mini-chip">{theme === 'light' ? 'Sky' : 'Gold'} Theme</span>
          </div>

          <div className="field-grid">
            <Field label="파일명"><input value={form.fileName} onChange={(e) => handleChange('fileName', e.target.value)} /></Field>
            <Field label="카드 제목"><input value={form.title} onChange={(e) => handleChange('title', e.target.value)} /></Field>
            <Field label="작은 설명"><input value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} /></Field>
            <Field label="캐릭터 이름"><input value={form.characterName} onChange={(e) => handleChange('characterName', e.target.value)} /></Field>
            <Field label="캐릭터 대사"><textarea rows={4} value={form.characterLine} onChange={(e) => handleChange('characterLine', e.target.value)} /></Field>
            <Field label="내 대사"><textarea rows={4} value={form.myLine} onChange={(e) => handleChange('myLine', e.target.value)} /></Field>
            <Field label="지문 / 서술"><textarea rows={4} value={form.narration} onChange={(e) => handleChange('narration', e.target.value)} /></Field>
            <Field label="하단 워터마크"><input value={form.footer} onChange={(e) => handleChange('footer', e.target.value)} /></Field>
            <Field label="캐릭터 이미지"><input type="file" accept="image/*" onChange={handleAvatarUpload} /></Field>
          </div>

          <div className="section-header second"><h2>스타일</h2></div>
          <div className="field-grid">
            <Field label="폰트">
              <select value={styleOptions.fontFamily} onChange={(e) => handleStyleChange('fontFamily', e.target.value)}>
                {fontOptions.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
              </select>
            </Field>
            <RangeField label={`본문 글자 크기: ${styleOptions.fontSize}px`} min="14" max="26" value={styleOptions.fontSize} onChange={(value) => handleStyleChange('fontSize', value)} />
            <RangeField label={`제목 크기: ${styleOptions.titleSize}px`} min="20" max="40" value={styleOptions.titleSize} onChange={(value) => handleStyleChange('titleSize', value)} />
            <RangeField label={`카드 라운드: ${styleOptions.radius}px`} min="18" max="42" value={styleOptions.radius} onChange={(value) => handleStyleChange('radius', value)} />
            <RangeField label={`카드 여백: ${styleOptions.padding}px`} min="20" max="44" value={styleOptions.padding} onChange={(value) => handleStyleChange('padding', value)} />
          </div>

          <div className="toggle-row">
            <Toggle checked={styleOptions.showSubtitle} onChange={(checked) => handleStyleChange('showSubtitle', checked)}>작은 설명 표시</Toggle>
            <Toggle checked={styleOptions.showFooter} onChange={(checked) => handleStyleChange('showFooter', checked)}>워터마크 표시</Toggle>
          </div>

          <div className="section-header second"><h2>내보내기</h2></div>
          <div className="export-row">
            <button className="export-btn" onClick={exportPNG} disabled={isExporting} type="button">PNG 저장</button>
            <button className="export-btn" onClick={exportWEBP} disabled={isExporting} type="button">WEBP 저장</button>
            <button className="export-btn primary" onClick={exportPDF} disabled={isExporting} type="button">PDF 저장</button>
          </div>

          <p className="helper-text">현재 버전은 미리보기 카드 그대로 저장됩니다. 모든 작업은 브라우저 안에서 처리됩니다.</p>
        </section>

        <section className="preview-panel glass-panel">
          <div className="section-header"><h2>실시간 미리보기</h2><span className="mini-chip">Live</span></div>
          <div className="preview-stage">
            <div
              ref={previewRef}
              className={`preview-card ${theme}`}
              style={{
                fontFamily: styleOptions.fontFamily,
                borderRadius: `${styleOptions.radius}px`,
                padding: `${styleOptions.padding}px`,
                fontSize: `${styleOptions.fontSize}px`,
              }}
            >
              <div className="card-orb orb-one" />
              <div className="card-orb orb-two" />

              <div className="preview-head">
                <div className="title-wrap">
                  {styleOptions.showSubtitle && <div className="preview-kicker">{form.subtitle || ' '}</div>}
                  <h3 style={{ fontSize: `${styleOptions.titleSize}px` }}>{form.title || ' '}</h3>
                </div>
                <div className="status-pill">{theme === 'light' ? 'Light' : 'Dark'}</div>
              </div>

              <div className="character-block">
                {avatarUrl ? <img className="avatar" src={avatarUrl} alt="캐릭터" /> : <div className="avatar avatar-fallback">{form.characterName?.slice(0, 1) || 'A'}</div>}
                <div className="character-meta">
                  <div className="character-name">{form.characterName || '캐릭터'}</div>
                  <div className="character-tag">AI Character Chat</div>
                </div>
              </div>

              <div className="bubble bubble-char">{form.characterLine || ' '}</div>
              <div className="narration">{form.narration || ' '}</div>
              <div className="bubble bubble-user">{form.myLine || ' '}</div>
              {styleOptions.showFooter && <div className="preview-footer"><span>{form.footer || ' '}</span></div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

function RangeField({ label, min, max, value, onChange }) {
  return (
    <Field label={label}>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  )
}

function Toggle({ checked, onChange, children }) {
  return (
    <label className="toggle-pill">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}

export default App
