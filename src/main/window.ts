import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { getSettings, setSettings } from './store'

const OVERLAY_WIDTH = 720
const OVERLAY_HEIGHT = 280

let overlayWindow: BrowserWindow | null = null

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow
}

export function createOverlayWindow(): BrowserWindow {
  const settings = getSettings()
  const display = screen.getPrimaryDisplay().workArea

  const x =
    settings.windowX != null
      ? settings.windowX
      : Math.round(display.x + (display.width - OVERLAY_WIDTH) / 2)
  const y =
    settings.windowY != null
      ? settings.windowY
      : Math.round(display.y + display.height - OVERLAY_HEIGHT - 48)

  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT + 220,
    x,
    y,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    alwaysOnTop: settings.pinned,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      partition: 'persist:ytm'
    }
  })

  if (settings.pinned) {
    overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  }

  applyOpacity(settings.translucencyEnabled, settings.translucency)

  overlayWindow.on('moved', () => {
    if (!overlayWindow) return
    const [wx, wy] = overlayWindow.getPosition()
    setSettings({ windowX: wx, windowY: wy })
  })

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })

  return overlayWindow
}

export function showOverlay(): void {
  const win = overlayWindow
  if (!win) return
  win.show()
  win.focus()
}

export function hideOverlay(): void {
  const win = overlayWindow
  if (!win) return
  const settings = getSettings()
  if (settings.pinned) return
  win.hide()
}

export function toggleOverlay(): void {
  const win = overlayWindow
  if (!win) return
  if (win.isVisible()) {
    hideOverlay()
  } else {
    showOverlay()
  }
}

export function applyPin(pinned: boolean): void {
  const win = overlayWindow
  if (!win) return
  win.setAlwaysOnTop(pinned, pinned ? 'screen-saver' : 'normal')
  if (pinned && !win.isVisible()) {
    win.show()
  }
}

export function applyOpacity(enabled: boolean, value: number): void {
  const win = overlayWindow
  if (!win) return
  const opacity = enabled ? Math.min(1, Math.max(0.15, value / 100)) : 1
  win.setOpacity(opacity)
}

export function expandOverlayForDrawer(expanded: boolean): void {
  const win = overlayWindow
  if (!win) return
  const [x, y] = win.getPosition()
  const height = expanded ? OVERLAY_HEIGHT + 220 : OVERLAY_HEIGHT + 40
  win.setBounds({ x, y, width: OVERLAY_WIDTH, height }, false)
}
