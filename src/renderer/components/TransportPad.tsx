import type { NowPlaying } from '@shared/types'
import {
  IconDislike,
  IconLike,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconShuffle
} from './Icons'

interface Props {
  nowPlaying: NowPlaying
}

export function TransportPad({ nowPlaying }: Props) {
  return (
    <div className="transport no-drag">
      <button
        type="button"
        className={`icon-btn like${nowPlaying.liked ? ' active' : ''}`}
        aria-label="Like"
        title="Like"
        onClick={() => void window.ytm.like()}
      >
        <IconLike />
      </button>
      <button
        type="button"
        className="icon-btn prev"
        aria-label="Previous"
        onClick={() => void window.ytm.previous()}
      >
        <IconPrev />
      </button>
      <button
        type="button"
        className="play-btn"
        aria-label={nowPlaying.isPlaying ? 'Pause' : 'Play'}
        onClick={() => void window.ytm.playPause()}
      >
        {nowPlaying.isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <button
        type="button"
        className="icon-btn next"
        aria-label="Next"
        onClick={() => void window.ytm.next()}
      >
        <IconNext />
      </button>
      <button
        type="button"
        className={`icon-btn dislike${nowPlaying.disliked ? ' active' : ''}`}
        aria-label="Dislike"
        title="Dislike"
        onClick={() => void window.ytm.dislike()}
      >
        <IconDislike />
      </button>
      <button
        type="button"
        className="icon-btn shuffle"
        aria-label="Shuffle"
        onClick={() => void window.ytm.shuffle()}
      >
        <IconShuffle />
      </button>
    </div>
  )
}
