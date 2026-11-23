import { LitElement, html, css, nothing } from 'lit'
import type { TemplateResult } from 'lit'
import { PRESETS, ROLES, type RoleKey } from './lib/presets'
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, ratio, onColor } from './lib/color'

type SceneKey = 'article' | 'admin'
interface Colors { bg: string; surface: string; accent: string }

// 原型 index.html 的 1:1 翻译：结构、样式、文案、交互均保持一致。
export class PaletteApp extends LitElement {
  // 全局 <style> 中除 :root / html,body / * 之外的规则，原样搬入组件作用域。
  static styles = css`
    *,*::before,*::after{box-sizing:border-box}
    :host{display:block;font:inherit;color:inherit}
    .num{
      display:inline-flex;align-items:center;justify-content:center;
      width:18px;height:18px;border-radius:50%;
      background:var(--ui-accent);color:#fff;font-size:11px;font-weight:600;
      flex:none;margin-right:6px;
    }
    .tool-top{
      padding:14px 22px;background:var(--ui-panel);
      border-bottom:1px solid var(--ui-line);
      display:flex;align-items:center;gap:14px;flex-wrap:wrap;
    }
    .tool-top h1{font-size:17px;margin:0;font-weight:600;letter-spacing:.02em}
    .layout{display:grid;grid-template-columns:348px minmax(0,1fr);gap:18px;padding:18px 22px 40px;align-items:start}
    .editor{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:10px;overflow:hidden}
    .block{padding:16px 18px;border-bottom:1px solid var(--ui-line)}
    .block:last-child{border-bottom:0}
    .block h2{font-size:13.5px;margin:0 0 12px;font-weight:600;display:flex;align-items:center}
    .block .hint{font-size:11.5px;color:var(--ui-muted);margin:-6px 0 12px}
    .presets{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .preset{
      border:1px solid var(--ui-line);background:#fff;border-radius:7px;
      padding:9px;text-align:left;cursor:pointer;font:inherit;color:var(--ui-text);
      transition:border-color .15s,background .15s;
    }
    .preset:hover{border-color:#bdbab0}
    .preset[aria-pressed="true"]{border-color:var(--ui-accent);background:var(--ui-accent-soft)}
    .preset .pname{font-size:12.5px;font-weight:600;margin-bottom:7px;display:block}
    .swatches{display:flex;gap:3px;height:14px}
    .swatches i{flex:1;border-radius:2px;border:1px solid rgba(0,0,0,.08)}
    .roles{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}
    .role{
      border:1px solid var(--ui-line);background:#fff;border-radius:6px;
      padding:8px 4px;cursor:pointer;font:inherit;font-size:12.5px;color:var(--ui-muted);
      display:flex;align-items:center;justify-content:center;gap:5px;
    }
    .role[aria-pressed="true"]{border-color:var(--ui-accent);color:var(--ui-accent);background:var(--ui-accent-soft);font-weight:600}
    .role i{width:11px;height:11px;border-radius:50%;border:1px solid rgba(0,0,0,.12);flex:none}
    .hexrow{display:flex;align-items:center;gap:8px;margin-bottom:12px}
    .hexrow .swatch{width:36px;height:36px;border:1px solid var(--ui-line);border-radius:6px;flex:none}
    .hexrow input[type="text"]{
      flex:1;min-width:0;height:36px;padding:0 10px;
      border:1px solid var(--ui-line);border-radius:6px;font:13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
      color:var(--ui-text);background:#fff;letter-spacing:.04em;text-transform:uppercase;
    }
    .hexrow input[type="text"].bad{border-color:var(--ui-warn);background:var(--ui-warn-soft)}
    .pad-label{font-size:11.5px;color:var(--ui-muted);display:flex;justify-content:space-between;margin-bottom:5px}
    .svpad{
      position:relative;width:100%;height:132px;border-radius:7px;cursor:crosshair;
      border:1px solid var(--ui-line);overflow:hidden;touch-action:none;
    }
    .hue{
      position:relative;width:100%;height:16px;border-radius:4px;cursor:pointer;margin-top:9px;
      background:linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%);
      border:1px solid var(--ui-line);touch-action:none;
    }
    .pad-dot,.hue-dot{
      position:absolute;width:13px;height:13px;border-radius:50%;
      border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.45);pointer-events:none;
      transform:translate(-50%,-50%);
    }
    .hue-dot{top:50%;width:11px;height:11px}
    .valuetable{width:100%;border-collapse:collapse;font-size:12.5px}
    .valuetable td{padding:6px 0;border-bottom:1px dashed var(--ui-line)}
    .valuetable td:last-child{text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
    .valuetable tr:last-child td{border-bottom:0}
    .dotinline{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px;border:1px solid rgba(0,0,0,.1)}
    .btnrow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
    .uibtn{
      border:1px solid var(--ui-line);background:#fff;color:var(--ui-text);
      border-radius:6px;padding:7px 11px;font:inherit;font-size:12.5px;cursor:pointer;
    }
    .uibtn:hover{border-color:#bdbab0}
    .uibtn.primary{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
    .stage{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:10px;overflow:hidden;min-width:0;position:relative}
    .stage-bar{
      display:flex;align-items:center;gap:12px;padding:12px 16px;
      border-bottom:1px solid var(--ui-line);flex-wrap:wrap;
    }
    .stage-bar .t{font-size:13.5px;font-weight:600}
    .seg{display:inline-flex;border:1px solid var(--ui-line);border-radius:6px;overflow:hidden}
    .seg button{
      border:0;background:#fff;color:var(--ui-muted);padding:6px 12px;
      font:inherit;font-size:12.5px;cursor:pointer;
    }
    .seg button+button{border-left:1px solid var(--ui-line)}
    .seg button[aria-pressed="true"]{background:var(--ui-accent);color:#fff}
    .stage-bar .note{font-size:11.5px;color:var(--ui-muted);margin-left:auto}
    .preview{
      --pv-bg:#F5F1E8;--pv-surface:#FBF8F1;--pv-accent:#2E6E6A;--pv-on:#FFFFFF;
      background:var(--pv-bg);padding:22px;min-height:430px;
    }
    .scene{display:none}
    .scene.on{display:block}
    .site-nav{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,.12)}
    .brand{font-family:"Songti SC","STSong",serif;font-size:19px}
    .site-nav nav{font-size:12.5px;color:var(--pv-accent)}
    .site-nav nav span{margin-left:14px}
    .article{
      background:var(--pv-surface);border:1px solid rgba(0,0,0,.1);border-radius:6px;
      padding:26px 28px;margin-top:20px;max-width:660px;
    }
    .kicker{color:var(--pv-accent);font-size:12px;letter-spacing:.08em;margin-bottom:12px}
    .article h2{font:500 25px/1.45 "Songti SC","STSong",serif;color:#2B2822;margin:0 0 8px}
    .article .meta{font-size:12px;color:#8A8578;margin:0 0 18px}
    .article p.body{color:#4A463D;font-size:13.5px;line-height:1.9;margin:0 0 22px}
    .fakefield{display:block;width:100%;max-width:320px;padding:9px 11px;margin-bottom:20px;
      border:1px solid #B9B5A9;border-radius:5px;background:var(--pv-surface);color:#2B2822;font:inherit;font-size:12.5px}
    .actions{display:flex;gap:10px;flex-wrap:wrap}
    .pvbtn{border-radius:5px;padding:9px 16px;font:inherit;font-size:13px;cursor:default}
    .pvbtn.primary{background:var(--pv-accent);color:var(--pv-on);border:1px solid var(--pv-accent)}
    .pvbtn.ghost{background:transparent;border:1px solid #B9B5A9;color:#3E3A31}
    .admin{display:grid;grid-template-columns:150px minmax(0,1fr);gap:0;border:1px solid rgba(0,0,0,.1);border-radius:6px;overflow:hidden;background:var(--pv-surface)}
    .admin-side{background:var(--pv-bg);padding:16px 12px;border-right:1px solid rgba(0,0,0,.1)}
    .admin-side .slogo{font-size:13px;font-weight:600;margin-bottom:18px;padding-left:8px}
    .admin-side .sitem{font-size:12.5px;padding:8px 10px;border-radius:5px;color:#555046;margin-bottom:4px}
    .admin-side .sitem.active{background:var(--pv-accent);color:var(--pv-on)}
    .admin-main{padding:16px 18px;min-width:0}
    .admin-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:10px}
    .admin-top strong{font-size:15px}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .stat{background:var(--pv-bg);border-radius:5px;padding:12px}
    .stat .lab{font-size:11.5px;color:#7B766A}
    .stat .val{font-size:20px;color:var(--pv-accent);margin-top:4px}
    .tbl{width:100%;border-collapse:collapse;font-size:12px}
    .tbl th{text-align:left;color:#8A8578;font-weight:400;padding:8px 6px;border-bottom:1px solid rgba(0,0,0,.1)}
    .tbl td{padding:9px 6px;border-bottom:1px solid rgba(0,0,0,.06);color:#454137}
    .tag{font-size:11px;padding:2px 8px;border-radius:3px;background:var(--pv-accent);color:var(--pv-on);display:inline-block}
    .tag.soft{background:var(--pv-bg);color:var(--pv-accent)}
    .a11y{border-top:1px solid var(--ui-line);padding:12px 16px;background:#FCFCFA}
    .a11y h3{font-size:12.5px;margin:0 0 8px;font-weight:600}
    .a11y .items{display:flex;gap:10px;flex-wrap:wrap}
    .ratio{border:1px solid var(--ui-line);border-radius:6px;padding:8px 10px;font-size:11.5px;min-width:180px;background:#fff}
    .ratio .r{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:600;margin-left:6px}
    .ok{color:#2E6E6A}.no{color:var(--ui-warn)}
    .a11y .fine{font-size:11px;color:var(--ui-muted);margin:8px 0 0}
    .toast{
      position:absolute;left:50%;bottom:16px;transform:translateX(-50%) translateY(20px);
      background:#2E2C27;color:#fff;font-size:12px;padding:8px 14px;border-radius:5px;
      opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;
    }
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    @media(max-width:880px){
      .layout{grid-template-columns:1fr}
      .admin{grid-template-columns:1fr}
      .admin-side{display:none}
      .stats{grid-template-columns:1fr 1fr}
    }
  `

  private theme = 0
  // 当前编辑的颜色角色（背景 / 工作面 / 主色）
  private activeRole: RoleKey = 'accent'
  private scene: SceneKey = 'article'
  private drafts: Record<number, Colors> = {}
  private hexDraft = PRESETS[0].accent
  private hexBad = false
  private toastMsg = ''
  private toastShow = false
  private dragging: 'sv' | 'hue' | null = null
  private toastTimer = 0

  private currentColors(): Colors {
    const base = PRESETS[this.theme]
    const d = this.drafts[this.theme]
    return d ? d : { bg: base.bg, surface: base.surface, accent: base.accent }
  }

  private setColor(value: string): void {
    const c = { ...this.currentColors() }
    c[this.activeRole] = value
    this.drafts[this.theme] = c
    this.hexDraft = value
    this.hexBad = false
    this.requestUpdate()
  }

  private hsvOfCurrent() {
    const rgb = hexToRgb(this.currentColors()[this.activeRole])
    return rgbToHsv(rgb.r, rgb.g, rgb.b)
  }

  private showToast(msg: string): void {
    this.toastMsg = msg
    this.toastShow = true
    this.requestUpdate()
    window.clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => {
      this.toastShow = false
      this.requestUpdate()
    }, 1600)
  }

  // 原型 bindDrag：读取元素坐标比例，回调 fn(x, y)。
  private pick(e: PointerEvent, el: HTMLElement): { x: number; y: number } {
    const r = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
    return { x, y }
  }

  private onSvDown = (e: PointerEvent): void => {
    this.dragging = 'sv'
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    this.onSvMove(e)
  }
  private onSvMove = (e: PointerEvent): void => {
    if (this.dragging !== 'sv') return
    const el = e.currentTarget as HTMLElement
    const { x, y } = this.pick(e, el)
    const hsv = this.hsvOfCurrent()
    const out = hsvToRgb(hsv.h, x, 1 - y)
    this.setColor(rgbToHex(out.r, out.g, out.b))
  }
  private onHueDown = (e: PointerEvent): void => {
    this.dragging = 'hue'
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    this.onHueMove(e)
  }
  private onHueMove = (e: PointerEvent): void => {
    if (this.dragging !== 'hue') return
    const el = e.currentTarget as HTMLElement
    const { x } = this.pick(e, el)
    const hsv = this.hsvOfCurrent()
    const out = hsvToRgb(x * 360, hsv.s || 0.6, hsv.v || 0.75)
    this.setColor(rgbToHex(out.r, out.g, out.b))
  }
  private onDragEnd = (): void => { this.dragging = null }

  private onHexInput = (e: Event): void => {
    const v = (e.target as HTMLInputElement).value.trim()
    this.hexDraft = v
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
      this.hexBad = true
      this.requestUpdate()
      return
    }
    let nv = v
    if (nv.length === 4) nv = '#' + nv[1] + nv[1] + nv[2] + nv[2] + nv[3] + nv[3]
    nv = nv.toUpperCase()
    const c = { ...this.currentColors() }
    c[this.activeRole] = nv
    this.drafts[this.theme] = c
    this.hexBad = false
    this.hexDraft = nv
    this.requestUpdate()
  }

  private onReset = (): void => {
    delete this.drafts[this.theme]
    this.hexDraft = this.currentColors()[this.activeRole]
    this.hexBad = false
    this.requestUpdate()
    this.showToast('已恢复当前预置')
  }

  private onCopy = async (): Promise<void> => {
    const c = this.currentColors()
    const text = ':root {\n  --color-bg: ' + c.bg + ';\n  --color-surface: ' + c.surface + ';\n  --color-accent: ' + c.accent + ';\n}'
    const done = (): void => this.showToast('CSS 变量已复制')
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); done() } catch { this.fallbackCopy(text, done) }
    } else {
      this.fallbackCopy(text, done)
    }
  }
  private fallbackCopy(text: string, done: () => void): void {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy'); done() } catch { this.showToast('复制失败，请手动选择色值') }
    document.body.removeChild(ta)
  }

  private selectPreset(i: number): void {
    this.theme = i
    this.hexDraft = this.currentColors()[this.activeRole]
    this.hexBad = false
    this.requestUpdate()
  }
  private selectRole(key: RoleKey): void {
    this.activeRole = key
    this.hexDraft = this.currentColors()[key]
    this.hexBad = false
    this.requestUpdate()
  }
  private selectScene(s: SceneKey): void {
    this.scene = s
    this.requestUpdate()
  }

  private renderPresets(): TemplateResult[] {
    return PRESETS.map((p, i) => html`
      <button class="preset" type="button" aria-pressed=${i === this.theme ? 'true' : 'false'}
        @click=${() => this.selectPreset(i)}>
        <span class="pname">${p.name}</span>
        <span class="swatches">
          <i style="background:${p.bg}"></i>
          <i style="background:${p.surface}"></i>
          <i style="background:${p.accent}"></i>
        </span>
      </button>`)
  }

  private renderRoles(): TemplateResult[] {
    const c = this.currentColors()
    return ROLES.map((r) => html`
      <button class="role" type="button" aria-pressed=${r.key === this.activeRole ? 'true' : 'false'}
        @click=${() => this.selectRole(r.key)}>
        <i style="background:${c[r.key]}"></i>${r.label}
      </button>`)
  }

  private renderValues(): TemplateResult[] {
    const c = this.currentColors()
    return ROLES.map((r) => html`
      <tr><td><span class="dotinline" style="background:${c[r.key]}"></span>${r.label}</td><td>${c[r.key]}</td></tr>`)
  }

  private renderA11y(): TemplateResult[] {
    const c = this.currentColors()
    const on = onColor(c.accent)
    const items = [
      { t: '正文 / 背景', v: ratio('#4A463D', c.bg) },
      { t: '正文 / 工作面', v: ratio('#4A463D', c.surface) },
      { t: '按钮文字 / 主色', v: ratio(on, c.accent) },
    ]
    return items.map((x) => {
      const ok = x.v >= 4.5
      return html`<div class="ratio">${x.t}<span class="r ${ok ? 'ok' : 'no'}">${x.v.toFixed(2)}:1</span>
        <span class="${ok ? 'ok' : 'no'}"> ${ok ? '达标' : '偏低'}</span></div>`
    })
  }

  render(): TemplateResult {
    const c = this.currentColors()
    const p = PRESETS[this.theme]
    const on = onColor(c.accent)
    const hsv = this.hsvOfCurrent()
    const svBg = 'linear-gradient(to top, #000, transparent),' +
      'linear-gradient(to right, #fff, transparent),' +
      'hsl(' + hsv.h + ',100%,50%)'
    const readout = 'H ' + Math.round(hsv.h) + '° · S ' + Math.round(hsv.s * 100) + ' · V ' + Math.round(hsv.v * 100)
    const changed = this.drafts[this.theme] && ROLES.some((r) => c[r.key] !== p[r.key])
    const previewStyle = `--pv-bg:${c.bg};--pv-surface:${c.surface};--pv-accent:${c.accent};--pv-on:${on}`

    return html`
      <div class="tool-top">
        <h1>配色试衣间</h1>
      </div>

      <div class="layout">
        <aside class="editor">
          <div class="block">
            <h2><span class="num">1</span>主题预置</h2>
            <p class="hint">六组原始配色保持不动，改动另存为草稿。</p>
            <div class="presets">${this.renderPresets()}</div>
          </div>

          <div class="block">
            <h2><span class="num">2</span>三色编辑 · 调色板</h2>
            <p class="hint">先选要编辑的角色，再用下方调色板拖动取色，或直接输入 HEX。</p>
            <div class="roles">${this.renderRoles()}</div>
            <div class="hexrow">
              <div class="swatch" style="background:${c[this.activeRole]}" title="只读展示 · 用下方调色板或 HEX 修改" role="img" aria-label=${'当前色 ' + c[this.activeRole]}></div>
              <input type="text" .value=${this.hexDraft} class=${this.hexBad ? 'bad' : ''}
                @input=${this.onHexInput} spellcheck="false" aria-label="HEX 色值输入" maxlength="7">
            </div>
            <div class="pad-label"><span>调色板 · 左右饱和度 / 上下明度</span><span>${readout}</span></div>
            <div class="svpad" style="background:${svBg}"
              @pointerdown=${this.onSvDown} @pointermove=${this.onSvMove}
              @pointerup=${this.onDragEnd} @pointercancel=${this.onDragEnd}>
              <div class="pad-dot" style="left:${hsv.s * 100}%;top:${(1 - hsv.v) * 100}%;background:${c[this.activeRole]}"></div>
            </div>
            <div class="hue"
              @pointerdown=${this.onHueDown} @pointermove=${this.onHueMove}
              @pointerup=${this.onDragEnd} @pointercancel=${this.onDragEnd}>
              <div class="hue-dot" style="left:${(hsv.h / 360) * 100}%;background:hsl(${hsv.h},100%,50%)"></div>
            </div>
          </div>

          <div class="block">
            <h2><span class="num">3</span>色值与导出</h2>
            <table class="valuetable">${this.renderValues()}</table>
            <div class="btnrow">
              <button class="uibtn primary" @click=${this.onCopy}>复制 CSS 变量</button>
              <button class="uibtn" @click=${this.onReset}>恢复当前预置</button>
            </div>
            <p class="hint" style="margin:10px 0 0">${changed ? '当前主题 · 已修改（草稿）' : '原始预置'}</p>
          </div>
        </aside>

        <main class="stage">
          <div class="stage-bar">
            <span class="t"><span class="num" style="background:#2E2C27">4</span>真实界面预览</span>
            <div class="seg">
              <button data-scene="article" aria-pressed=${this.scene === 'article' ? 'true' : 'false'}
                @click=${() => this.selectScene('article')}>内容展示页</button>
              <button data-scene="admin" aria-pressed=${this.scene === 'admin' ? 'true' : 'false'}
                @click=${() => this.selectScene('admin')}>管理工作台</button>
            </div>
            <span class="note">同一套配色，两个场景同时看</span>
          </div>

          <div class="preview" style=${previewStyle}>
            <div class="scene ${this.scene === 'article' ? 'on' : ''}" data-scene="article">
              <div class="site-nav">
                <span class="brand">山间手记</span>
                <nav><span>首页</span><span>随笔</span><span>关于</span></nav>
              </div>
              <div class="article">
                <div class="kicker">设计笔记</div>
                <h2>让颜色，找到合适的位置</h2>
                <p class="meta">悠然 · 2026 年 11 月</p>
                <p class="body">同一套布局，切换预置或拖动调色板，观察背景、工作面与主色的关系如何改变阅读体验与操作焦点。正文与按钮文字会随颜色变化给出可读性提示。</p>
                <label class="fakefield" for="fake">方案名称　我的主题方案</label>
                <div class="actions">
                  <button class="pvbtn primary">继续阅读</button>
                  <button class="pvbtn ghost">收藏</button>
                </div>
              </div>
            </div>

            <div class="scene ${this.scene === 'admin' ? 'on' : ''}" data-scene="admin">
              <div class="admin">
                <div class="admin-side">
                  <div class="slogo">内容工作台</div>
                  <div class="sitem active">概览</div>
                  <div class="sitem">内容管理</div>
                  <div class="sitem">数据看板</div>
                  <div class="sitem">设置</div>
                </div>
                <div class="admin-main">
                  <div class="admin-top"><strong>内容管理</strong><button class="pvbtn primary">新建内容</button></div>
                  <div class="stats">
                    <div class="stat"><div class="lab">本月发布</div><div class="val">24</div></div>
                    <div class="stat"><div class="lab">待审核</div><div class="val">06</div></div>
                    <div class="stat"><div class="lab">草稿</div><div class="val">12</div></div>
                  </div>
                  <table class="tbl">
                    <thead><tr><th>标题</th><th>状态</th><th>更新</th></tr></thead>
                    <tbody>
                      <tr><td>秋山问道</td><td><span class="tag">已发布</span></td><td>11-20</td></tr>
                      <tr><td>松风入耳</td><td><span class="tag soft">草稿</span></td><td>11-18</td></tr>
                      <tr><td>溪畔独坐</td><td><span class="tag">已发布</span></td><td>11-15</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="a11y">
            <h3>可读性检查 · 只针对以下颜色组合，不代表整页合规</h3>
            <div class="items">${this.renderA11y()}</div>
            <p class="fine">口径：WCAG 相对亮度计算对比度；正文阈值 4.5:1，按钮文字按实测取黑或白。工具界面本身不随主题变色，避免干扰判断。</p>
          </div>
          <div class="toast ${this.toastShow ? 'show' : ''}">${this.toastMsg || nothing}</div>
        </main>
      </div>
    `
  }
}

customElements.define('palette-app', PaletteApp)
