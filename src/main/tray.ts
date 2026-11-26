import { Menu, Tray, nativeImage, app } from 'electron'
import { join } from 'path'
import { showOverlay } from './window'

let tray: Tray | null = null

function createTrayIcon(): Electron.NativeImage {
  const iconPath = join(__dirname, '../../resources/tray.png')
  const img = nativeImage.createFromPath(iconPath)
  if (!img.isEmpty()) {
    return img.resize({ width: 16, height: 16 })
  }
  // 16x16 solid red fallback PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKElEQVQ4T2NkYGD4z0ABYBzVMKoBBgP+/ydVA0bVx6gGGAUYDQAAXQEBAfq1mM0AAAAASUVORK5CYII=',
    'base64'
  )
  return nativeImage.createFromBuffer(png)
}

export function createTray(): Tray {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('YTM-Desktop')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open',
        click: () => showOverlay()
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          app.quit()
        }
      }
    ])
  )
  tray.on('double-click', () => showOverlay())
  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
