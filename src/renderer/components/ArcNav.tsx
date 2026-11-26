import type { DrawerSource } from '@shared/types'
import { IconHeart, IconReplay, IconSearch, IconStar } from './Icons'

interface Props {
  active: DrawerSource
  onSelect: (source: Exclude<DrawerSource, null>) => void
}

export function ArcNav({ active, onSelect }: Props) {
  return (
    <nav className="arc-nav no-drag" aria-label="Library shelves">
      <button
        type="button"
        className={`arc-btn${active === 'listen-again' ? ' active' : ''}`}
        title="Listen Again"
        aria-label="Listen Again"
        onClick={() => onSelect('listen-again')}
      >
        <IconReplay />
      </button>
      <button
        type="button"
        className={`arc-btn${active === 'quick-picks' ? ' active' : ''}`}
        title="Quick Picks"
        aria-label="Quick Picks"
        onClick={() => onSelect('quick-picks')}
      >
        <IconStar />
      </button>
      <button
        type="button"
        className={`arc-btn${active === 'forgotten-faves' ? ' active' : ''}`}
        title="Forgotten Favorites"
        aria-label="Forgotten Favorites"
        onClick={() => onSelect('forgotten-faves')}
      >
        <IconHeart />
      </button>
      <button
        type="button"
        className={`search-fab${active === 'search' ? ' active' : ''}`}
        title="Search"
        aria-label="Search"
        onClick={() => onSelect('search')}
      >
        <IconSearch />
      </button>
    </nav>
  )
}
