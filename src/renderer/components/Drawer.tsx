import { FormEvent, useState } from 'react'
import type { DrawerMode, DrawerSource, TrackItem } from '@shared/types'
import { IconSearch } from './Icons'

interface Props {
  mode: DrawerMode
  source: DrawerSource
  tracks: TrackItem[]
  loading: boolean
  onSearch: (query: string) => void
  onPlay: (id: string) => void
}

function formatDuration(sec: number | null): string {
  if (sec == null || Number.isNaN(sec)) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Drawer({ mode, source, tracks, loading, onSearch, onPlay }: Props) {
  const [query, setQuery] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const className =
    mode === 'closed' ? 'drawer' : mode === 'peek-search' ? 'drawer peek' : 'drawer open'

  return (
    <aside className={className} aria-hidden={mode === 'closed'}>
      <div className="drawer-inner no-drag">
        {(source === 'search' || mode === 'peek-search') && (
          <form className="search-row" onSubmit={onSubmit}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube Music"
              autoFocus={mode === 'peek-search'}
            />
            <button type="submit" aria-label="Search">
              <IconSearch />
            </button>
          </form>
        )}

        {mode === 'open' && (
          <>
            {loading && <p className="empty-note">Loading…</p>}
            {!loading && tracks.length === 0 && (
              <p className="empty-note">
                {source === 'search'
                  ? 'No results yet. Try a search.'
                  : 'Sign in to load this shelf, or try again.'}
              </p>
            )}
            {!loading && tracks.length > 0 && (
              <ul className="track-list">
                {tracks.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => onPlay(t.id)}>
                      {t.albumArtUrl ? (
                        <img src={t.albumArtUrl} alt="" />
                      ) : (
                        <div className="track-art-fallback" />
                      )}
                      <div className="track-meta">
                        <strong>{t.title}</strong>
                        <span>{t.artist}</span>
                      </div>
                      <span className="track-dur">{formatDuration(t.durationSec)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
