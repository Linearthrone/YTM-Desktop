import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import {
  applyOpacity,
  applyPin,
  createOverlayWindow,
  getOverlayWindow,
  showOverlay,
  toggleOverlay
} from './window'
import { createTray, destroyTray } from './tray'
import { getRegisteredHotkey, registerHotkey, unregisterHotkeys } from './hotkey'
import { getSettings, setSettings } from './store'
import { getProfile, openSignInWindow, signOut } from './auth'
import { fetchShelf, invalidateClient, searchTracks } from './api'
import {
  createPlayerWindow,
  destroyPlayer,
  dislike,
  getNowPlaying,
  like,
  next,
  playPause,
  playTrack,
  previous,
  seek,
  setNowPlayingListener,
  shuffle
} from './player'
import { AppSettings, DrawerSource } from '../shared/types'

function broadcastSettings(settings: AppSettings): void {
  getOverlayWindow()?.webContents.send('settings:update', settings)
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.linearthrone.ytm-desktop')

  createPlayerWindow()
  const overlay = createOverlayWindow()

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    void overlay.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else if (!app.isPackaged) {
    void overlay.loadURL('http://localhost:5173')
  } else {
    void overlay.loadFile(join(__dirname, '../renderer/index.html'))
  }

  createTray()
  registerHotkey(() => toggleOverlay())
  setSettings({ hotkey: getRegisteredHotkey() })

  setNowPlayingListener((np) => {
    getOverlayWindow()?.webContents.send('nowplaying:update', np)
  })

  registerIpc()
  showOverlay()
})

function registerIpc(): void {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:set', (_e, partial: Partial<AppSettings>) => {
    const next = setSettings(partial)
    if (partial.pinned != null) applyPin(next.pinned)
    if (partial.translucency != null || partial.translucencyEnabled != null) {
      applyOpacity(next.translucencyEnabled, next.translucency)
    }
    broadcastSettings(next)
    return next
  })
  ipcMain.handle('overlay:toggle', () => {
    toggleOverlay()
  })
  ipcMain.handle('overlay:setPinned', (_e, pinned: boolean) => {
    const next = setSettings({ pinned })
    applyPin(pinned)
    broadcastSettings(next)
    return next
  })
  ipcMain.handle('profile:get', () => getProfile())
  ipcMain.handle('profile:signIn', async () => {
    const profile = await openSignInWindow()
    await invalidateClient()
    getOverlayWindow()?.webContents.send('profile:update', profile)
    return profile
  })
  ipcMain.handle('profile:signOut', async () => {
    const profile = await signOut()
    await invalidateClient()
    getOverlayWindow()?.webContents.send('profile:update', profile)
    return profile
  })
  ipcMain.handle('player:nowPlaying', () => getNowPlaying())
  ipcMain.handle('player:playPause', () => playPause())
  ipcMain.handle('player:next', () => next())
  ipcMain.handle('player:previous', () => previous())
  ipcMain.handle('player:like', () => like())
  ipcMain.handle('player:dislike', () => dislike())
  ipcMain.handle('player:shuffle', () => shuffle())
  ipcMain.handle('player:seek', (_e, ratio: number) => seek(ratio))
  ipcMain.handle('player:playTrack', (_e, videoId: string) => playTrack(videoId))
  ipcMain.handle(
    'shelf:fetch',
    (_e, source: Exclude<DrawerSource, 'search' | null>) => fetchShelf(source)
  )
  ipcMain.handle('shelf:search', (_e, query: string) => searchTracks(query))
  ipcMain.handle('shell:openExternal', (_e, url: string) => shell.openExternal(url))
}

app.on('window-all-closed', () => {
  // Stay alive in the tray on Windows.
})

app.on('before-quit', () => {
  unregisterHotkeys()
  destroyTray()
  destroyPlayer()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow()
  } else {
    showOverlay()
  }
})
