export type ThemeId = 'neon-red' | 'neon-cyan' | 'neon-violet' | 'emerald' | 'mono'

export type DrawerMode = 'closed' | 'peek-search' | 'open'

export type DrawerSource = 'listen-again' | 'quick-picks' | 'forgotten-faves' | 'search' | null

export interface AppSettings {
  theme: ThemeId
  translucencyEnabled: boolean
  translucency: number
  pinned: boolean
  windowX: number | null
  windowY: number | null
  hotkey: string
}

export interface ProfileInfo {
  signedIn: boolean
  name: string | null
  avatarUrl: string | null
}

export interface NowPlaying {
  title: string
  artist: string
  albumArtUrl: string | null
  durationSec: number
  positionSec: number
  isPlaying: boolean
  videoId: string | null
  liked: boolean
  disliked: boolean
}

export interface TrackItem {
  id: string
  title: string
  artist: string
  albumArtUrl: string | null
  durationSec: number | null
}

export interface OverlayApi {
  getSettings: () => Promise<AppSettings>
  setSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
  toggleVisibility: () => Promise<void>
  setPinned: (pinned: boolean) => Promise<AppSettings>
  getProfile: () => Promise<ProfileInfo>
  signIn: () => Promise<ProfileInfo>
  signOut: () => Promise<ProfileInfo>
  getNowPlaying: () => Promise<NowPlaying>
  playPause: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  like: () => Promise<void>
  dislike: () => Promise<void>
  shuffle: () => Promise<void>
  seek: (ratio: number) => Promise<void>
  playTrack: (videoId: string) => Promise<void>
  fetchShelf: (source: Exclude<DrawerSource, 'search' | null>) => Promise<TrackItem[]>
  search: (query: string) => Promise<TrackItem[]>
  onNowPlaying: (cb: (np: NowPlaying) => void) => () => void
  onProfile: (cb: (p: ProfileInfo) => void) => () => void
  onSettings: (cb: (s: AppSettings) => void) => () => void
}

declare global {
  interface Window {
    ytm: OverlayApi
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'neon-red',
  translucencyEnabled: true,
  translucency: 78,
  pinned: false,
  windowX: null,
  windowY: null,
  hotkey: 'Meta+Y'
}

export const EMPTY_NOW_PLAYING: NowPlaying = {
  title: 'Nothing playing',
  artist: 'Sign in to YouTube Music',
  albumArtUrl: null,
  durationSec: 0,
  positionSec: 0,
  isPlaying: false,
  videoId: null,
  liked: false,
  disliked: false
}
