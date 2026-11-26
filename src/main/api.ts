import { Innertube, UniversalCache } from 'youtubei.js'
import { DrawerSource, TrackItem } from '../shared/types'
import { getCookieHeader, isSignedIn } from './auth'

let innertube: Innertube | null = null

async function getClient(): Promise<Innertube> {
  const cookie = (await isSignedIn()) ? await getCookieHeader() : undefined
  innertube = await Innertube.create({
    cache: new UniversalCache(false),
    cookie,
    generate_session_locally: true
  })
  return innertube
}

function mapMusicItems(items: unknown[]): TrackItem[] {
  const tracks: TrackItem[] = []
  for (const item of items) {
    const anyItem = item as {
      id?: string
      video_id?: string
      title?: string | { text?: string }
      authors?: Array<{ name?: string }>
      artists?: Array<{ name?: string }>
      author?: { name?: string }
      thumbnail?: { contents?: Array<{ url?: string }> } | Array<{ url?: string }>
      duration?: { seconds?: number } | number
      duration_seconds?: number
    }

    const id = anyItem.id ?? anyItem.video_id
    if (!id) continue

    const title =
      typeof anyItem.title === 'string'
        ? anyItem.title
        : (anyItem.title?.text ?? 'Unknown')

    const artist =
      anyItem.artists?.map((a) => a.name).filter(Boolean).join(', ') ||
      anyItem.authors?.map((a) => a.name).filter(Boolean).join(', ') ||
      anyItem.author?.name ||
      'Unknown artist'

    let albumArtUrl: string | null = null
    const thumb = anyItem.thumbnail
    if (Array.isArray(thumb)) {
      albumArtUrl = thumb.at(-1)?.url ?? null
    } else if (thumb?.contents) {
      albumArtUrl = thumb.contents.at(-1)?.url ?? null
    }

    const durationSec =
      typeof anyItem.duration === 'number'
        ? anyItem.duration
        : (anyItem.duration?.seconds ?? anyItem.duration_seconds ?? null)

    tracks.push({ id, title, artist, albumArtUrl, durationSec })
  }
  return tracks
}

function extractShelfTracks(home: {
  sections?: unknown[]
}): TrackItem[] {
  const sections = home.sections ?? []
  const tracks: TrackItem[] = []
  for (const section of sections) {
    const s = section as { contents?: unknown[]; items?: unknown[] }
    const contents = s.contents ?? s.items ?? []
    tracks.push(...mapMusicItems(contents))
  }
  return tracks
}

export async function fetchShelf(
  source: Exclude<DrawerSource, 'search' | null>
): Promise<TrackItem[]> {
  const yt = await getClient()
  const music = yt.music

  if (source === 'listen-again') {
    const home = await music.getHomeFeed()
    const sections = (home as { sections?: Array<{ title?: { text?: string }; contents?: unknown[] }> })
      .sections ?? []
    const match = sections.find((s) =>
      /listen again/i.test(s.title?.text ?? '')
    )
    if (match?.contents) return mapMusicItems(match.contents)
    return extractShelfTracks(home as { sections?: unknown[] }).slice(0, 30)
  }

  if (source === 'quick-picks') {
    const home = await music.getHomeFeed()
    const sections = (home as { sections?: Array<{ title?: { text?: string }; contents?: unknown[] }> })
      .sections ?? []
    const match = sections.find((s) =>
      /quick picks/i.test(s.title?.text ?? '')
    )
    if (match?.contents) return mapMusicItems(match.contents)
    return extractShelfTracks(home as { sections?: unknown[] }).slice(0, 30)
  }

  // forgotten-faves — approximate via library / history flavored home content
  try {
    const library = await music.getLibrary()
    const contents =
      (library as { contents?: unknown[]; sections?: Array<{ contents?: unknown[] }> }).contents ??
      (library as { sections?: Array<{ contents?: unknown[] }> }).sections?.flatMap(
        (s) => s.contents ?? []
      ) ??
      []
    const mapped = mapMusicItems(contents)
    if (mapped.length) return mapped.slice(0, 40)
  } catch {
    // fall through
  }

  const home = await music.getHomeFeed()
  return extractShelfTracks(home as { sections?: unknown[] }).slice(0, 30)
}

export async function searchTracks(query: string): Promise<TrackItem[]> {
  const yt = await getClient()
  const results = await yt.music.search(query, { type: 'song' })
  const contents =
    (results as { songs?: { contents?: unknown[] }; contents?: unknown[] }).songs
      ?.contents ??
    (results as { contents?: unknown[] }).contents ??
    []
  return mapMusicItems(contents)
}

export async function invalidateClient(): Promise<void> {
  innertube = null
}
