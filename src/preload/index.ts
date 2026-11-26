import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppSettings,
  DrawerSource,
  NowPlaying,
  OverlayApi,
  ProfileInfo
} from '../shared/types'

const api: OverlayApi = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
  toggleVisibility: () => ipcRenderer.invoke('overlay:toggle'),
  setPinned: (pinned) => ipcRenderer.invoke('overlay:setPinned', pinned),
  getProfile: () => ipcRenderer.invoke('profile:get'),
  signIn: () => ipcRenderer.invoke('profile:signIn'),
  signOut: () => ipcRenderer.invoke('profile:signOut'),
  getNowPlaying: () => ipcRenderer.invoke('player:nowPlaying'),
  playPause: () => ipcRenderer.invoke('player:playPause'),
  next: () => ipcRenderer.invoke('player:next'),
  previous: () => ipcRenderer.invoke('player:previous'),
  like: () => ipcRenderer.invoke('player:like'),
  dislike: () => ipcRenderer.invoke('player:dislike'),
  shuffle: () => ipcRenderer.invoke('player:shuffle'),
  seek: (ratio) => ipcRenderer.invoke('player:seek', ratio),
  playTrack: (videoId) => ipcRenderer.invoke('player:playTrack', videoId),
  fetchShelf: (source: Exclude<DrawerSource, 'search' | null>) =>
    ipcRenderer.invoke('shelf:fetch', source),
  search: (query) => ipcRenderer.invoke('shelf:search', query),
  onNowPlaying: (cb) => {
    const listener = (_: Electron.IpcRendererEvent, np: NowPlaying) => cb(np)
    ipcRenderer.on('nowplaying:update', listener)
    return () => ipcRenderer.removeListener('nowplaying:update', listener)
  },
  onProfile: (cb) => {
    const listener = (_: Electron.IpcRendererEvent, p: ProfileInfo) => cb(p)
    ipcRenderer.on('profile:update', listener)
    return () => ipcRenderer.removeListener('profile:update', listener)
  },
  onSettings: (cb) => {
    const listener = (_: Electron.IpcRendererEvent, s: AppSettings) => cb(s)
    ipcRenderer.on('settings:update', listener)
    return () => ipcRenderer.removeListener('settings:update', listener)
  }
}

contextBridge.exposeInMainWorld('ytm', api)
