import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  DrawerMode,
  DrawerSource,
  EMPTY_NOW_PLAYING,
  NowPlaying,
  ProfileInfo,
  TrackItem
} from '@shared/types'
import { ArcNav } from './components/ArcNav'
import { AvatarMenu } from './components/AvatarMenu'
import { Drawer } from './components/Drawer'
import { IconPin } from './components/Icons'
import { SettingsPanel } from './components/SettingsPanel'
import { TransportPad } from './components/TransportPad'

function formatTime(sec: number): string {
  if (!sec || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const WAVE = [8, 14, 22, 16, 26, 12, 20, 28, 18, 24, 11, 19, 27, 15, 21, 10, 17, 25, 13, 23]

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [profile, setProfile] = useState<ProfileInfo>({
    signedIn: false,
    name: null,
    avatarUrl: null
  })
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>(EMPTY_NOW_PLAYING)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed')
  const [drawerSource, setDrawerSource] = useState<DrawerSource>(null)
  const [tracks, setTracks] = useState<TrackItem[]>([])
  const [loading, setLoading] = useState(false)
  const switching = useRef(false)

  useEffect(() => {
    void window.ytm.getSettings().then(setSettings)
    void window.ytm.getProfile().then(setProfile)
    void window.ytm.getNowPlaying().then(setNowPlaying)
    const offNp = window.ytm.onNowPlaying(setNowPlaying)
    const offPr = window.ytm.onProfile(setProfile)
    const offSt = window.ytm.onSettings(setSettings)
    return () => {
      offNp()
      offPr()
      offSt()
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  const closeDrawer = useCallback(() => {
    setDrawerMode('closed')
    setDrawerSource(null)
    setTracks([])
  }, [])

  const openShelf = useCallback(
    async (source: Exclude<DrawerSource, 'search' | null>) => {
      if (switching.current) return
      switching.current = true
      if (drawerMode !== 'closed') {
        setDrawerMode('closed')
        await new Promise((r) => setTimeout(r, 280))
      }
      setDrawerSource(source)
      setLoading(true)
      setDrawerMode('open')
      try {
        const items = await window.ytm.fetchShelf(source)
        setTracks(items)
      } catch {
        setTracks([])
      } finally {
        setLoading(false)
        switching.current = false
      }
    },
    [drawerMode]
  )

  const openSearch = useCallback(async () => {
    if (switching.current) return
    switching.current = true
    if (drawerMode !== 'closed') {
      setDrawerMode('closed')
      await new Promise((r) => setTimeout(r, 280))
    }
    setDrawerSource('search')
    setTracks([])
    setDrawerMode('peek-search')
    switching.current = false
  }, [drawerMode])

  const onArcSelect = (source: Exclude<DrawerSource, null>) => {
    if (source === 'search') {
      void openSearch()
      return
    }
    void openShelf(source)
  }

  const onSearch = async (query: string) => {
    setLoading(true)
    setDrawerMode('open')
    try {
      const items = await window.ytm.search(query)
      setTracks(items)
    } catch {
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  const onShellClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.drawer') || target.closest('.arc-nav')) return
    if (drawerMode !== 'closed') closeDrawer()
    if (
      !target.closest('.avatar-btn') &&
      !target.closest('.menu-pop') &&
      !target.closest('.satellites')
    ) {
      setMenuOpen(false)
    }
  }

  const progress =
    nowPlaying.durationSec > 0
      ? (nowPlaying.positionSec / nowPlaying.durationSec) * 100
      : 0

  return (
    <div className="app-shell" onClick={onShellClick}>
      <div className="hud drag">
        <ArcNav active={drawerSource} onSelect={onArcSelect} />

        <div className={`body${settings.translucencyEnabled ? '' : ' solid'}`}>
          <div className="chamber left">
            <div className="disc-wrap">
              <div className={`disc${nowPlaying.isPlaying ? ' spinning' : ''}`}>
                {nowPlaying.albumArtUrl && (
                  <img src={nowPlaying.albumArtUrl} alt="" draggable={false} />
                )}
              </div>
            </div>
          </div>

          <div className="bridge">
            <div className="waveform" aria-hidden>
              {WAVE.map((h, i) => (
                <span key={i} style={{ height: h }} />
              ))}
            </div>
            <div className="now-playing">
              <div className="eyebrow">Now Playing</div>
              <div className="title">{nowPlaying.title}</div>
              <div className="artist">{nowPlaying.artist}</div>
              <div className="source-row">
                <span className="yt-mark" aria-hidden>
                  ▶
                </span>
                YouTube Music
              </div>
              <div className="time-row">
                {formatTime(nowPlaying.positionSec)} / {formatTime(nowPlaying.durationSec)}
              </div>
              <div
                className="progress no-drag"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  void window.ytm.seek(ratio)
                }}
              >
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="chamber right">
            <TransportPad nowPlaying={nowPlaying} />
          </div>
        </div>

        <div className="satellites no-drag">
          <button
            type="button"
            className={`neon-chip pin-btn${settings.pinned ? ' pinned' : ''}`}
            aria-label={settings.pinned ? 'Unpin overlay' : 'Pin overlay'}
            title={settings.pinned ? 'Pinned' : 'Pin'}
            onClick={() => void window.ytm.setPinned(!settings.pinned)}
          >
            <IconPin />
          </button>
          <AvatarMenu
            profile={profile}
            open={menuOpen}
            onToggle={() => setMenuOpen((v) => !v)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>

        {settingsOpen && (
          <SettingsPanel settings={settings} onClose={() => setSettingsOpen(false)} />
        )}
      </div>

      <Drawer
        mode={drawerMode}
        source={drawerSource}
        tracks={tracks}
        loading={loading}
        onSearch={(q) => void onSearch(q)}
        onPlay={(id) => void window.ytm.playTrack(id)}
      />
    </div>
  )
}
