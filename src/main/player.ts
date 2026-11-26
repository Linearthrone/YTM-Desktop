import { BrowserWindow } from 'electron'
import { EMPTY_NOW_PLAYING, NowPlaying } from '../shared/types'

let playerWindow: BrowserWindow | null = null
let latest: NowPlaying = { ...EMPTY_NOW_PLAYING }
let pollTimer: NodeJS.Timeout | null = null
let onUpdate: ((np: NowPlaying) => void) | null = null

const POLL_SCRIPT = `
(() => {
  const doc = document;
  const titleEl = doc.querySelector('.title.ytmusic-player-bar, .ytmusic-player-bar .title');
  const artistEl = doc.querySelector('.byline.ytmusic-player-bar, .ytmusic-player-bar .byline');
  const imgEl = doc.querySelector('.ytmusic-player-bar img, #song-image img');
  const timeEl = doc.querySelector('.time-info, .ytmusic-player-bar .time-info');
  const playBtn = doc.querySelector('#play-pause-button, .play-pause-button');
  const liked = !!doc.querySelector('ytmusic-like-button-renderer[like-status="LIKE"], .like[aria-pressed="true"]');
  const disliked = !!doc.querySelector('ytmusic-like-button-renderer[like-status="DISLIKE"], .dislike[aria-pressed="true"]');
  const videoId = (location.href.match(/v=([\\w-]{11})/) || [])[1] || null;

  let positionSec = 0;
  let durationSec = 0;
  if (timeEl && timeEl.textContent) {
    const parts = timeEl.textContent.trim().split('/');
    const parse = (t) => {
      const segs = t.trim().split(':').map(Number);
      if (segs.length === 3) return segs[0]*3600 + segs[1]*60 + segs[2];
      if (segs.length === 2) return segs[0]*60 + segs[1];
      return 0;
    };
    if (parts.length === 2) {
      positionSec = parse(parts[0]);
      durationSec = parse(parts[1]);
    }
  }

  const pressed = playBtn && (playBtn.getAttribute('title') || playBtn.getAttribute('aria-label') || '');
  const isPlaying = /pause/i.test(pressed || '');

  return {
    title: titleEl ? titleEl.textContent.trim() : 'Nothing playing',
    artist: artistEl ? artistEl.textContent.trim() : '',
    albumArtUrl: imgEl ? imgEl.src : null,
    durationSec,
    positionSec,
    isPlaying,
    videoId,
    liked,
    disliked
  };
})()
`

function clickSelector(selector: string): void {
  if (!playerWindow) return
  void playerWindow.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (el) el.click();
    })()
  `)
}

export function setNowPlayingListener(cb: (np: NowPlaying) => void): void {
  onUpdate = cb
}

export function getNowPlaying(): NowPlaying {
  return latest
}

export function createPlayerWindow(): BrowserWindow {
  playerWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      partition: 'persist:ytm',
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  })

  void playerWindow.loadURL('https://music.youtube.com')

  playerWindow.on('closed', () => {
    playerWindow = null
    if (pollTimer) clearInterval(pollTimer)
  })

  pollTimer = setInterval(() => {
    void pollNowPlaying()
  }, 1000)

  return playerWindow
}

async function pollNowPlaying(): Promise<void> {
  if (!playerWindow || playerWindow.isDestroyed()) return
  try {
    const result = (await playerWindow.webContents.executeJavaScript(POLL_SCRIPT)) as NowPlaying
    if (!result) return
    latest = {
      ...EMPTY_NOW_PLAYING,
      ...result,
      title: result.title || EMPTY_NOW_PLAYING.title,
      artist: result.artist || EMPTY_NOW_PLAYING.artist
    }
    onUpdate?.(latest)
  } catch {
    // page may still be loading
  }
}

export async function playPause(): Promise<void> {
  clickSelector('#play-pause-button, .play-pause-button')
}

export async function next(): Promise<void> {
  clickSelector('.next-button, .ytmusic-player-bar .next-button')
}

export async function previous(): Promise<void> {
  clickSelector('.previous-button, .ytmusic-player-bar .previous-button')
}

export async function like(): Promise<void> {
  clickSelector(
    'ytmusic-like-button-renderer #button-shape-like button, .like-button-renderer-like-button, ytmusic-like-button-renderer button[aria-label*="Like"]'
  )
}

export async function dislike(): Promise<void> {
  clickSelector(
    'ytmusic-like-button-renderer #button-shape-dislike button, .like-button-renderer-dislike-button, ytmusic-like-button-renderer button[aria-label*="Dislike"]'
  )
}

export async function shuffle(): Promise<void> {
  clickSelector('.shuffle button, ytmusic-shuffle-button-renderer button, [aria-label*="Shuffle"]')
}

export async function seek(ratio: number): Promise<void> {
  if (!playerWindow) return
  const r = Math.min(1, Math.max(0, ratio))
  await playerWindow.webContents.executeJavaScript(`
    (() => {
      const bar = document.querySelector('#progress-bar, tp-yt-paper-slider#progress-bar, .ytmusic-player-bar tp-yt-paper-slider');
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const x = rect.left + rect.width * ${r};
      const y = rect.top + rect.height / 2;
      for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click']) {
        bar.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
      }
    })()
  `)
}

export async function playTrack(videoId: string): Promise<void> {
  if (!playerWindow) return
  await playerWindow.loadURL(`https://music.youtube.com/watch?v=${videoId}`)
}

export function destroyPlayer(): void {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  playerWindow?.destroy()
  playerWindow = null
}
