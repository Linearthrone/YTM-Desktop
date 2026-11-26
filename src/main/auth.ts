import { BrowserWindow, session, shell } from 'electron'
import { ProfileInfo } from '../shared/types'

const PARTITION = 'persist:ytm'
const MUSIC_URL = 'https://music.youtube.com'

let authWindow: BrowserWindow | null = null

export function getYtmSession() {
  return session.fromPartition(PARTITION)
}

export async function getCookieHeader(): Promise<string> {
  const cookies = await getYtmSession().cookies.get({ url: MUSIC_URL })
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ')
}

export async function isSignedIn(): Promise<boolean> {
  const cookies = await getYtmSession().cookies.get({ url: MUSIC_URL })
  return cookies.some((c) => c.name.includes('SAPISID') || c.name.includes('SID'))
}

export async function getProfile(): Promise<ProfileInfo> {
  if (!(await isSignedIn())) {
    return { signedIn: false, name: null, avatarUrl: null }
  }

  try {
    const cookie = await getCookieHeader()
    const res = await fetch(`${MUSIC_URL}/get_account_menu?hl=en&gl=US`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20241125.01.00'
          }
        }
      })
    })

    if (!res.ok) {
      return { signedIn: true, name: 'YouTube Music', avatarUrl: null }
    }

    const data = (await res.json()) as {
      actions?: Array<{
        openPopupAction?: {
          popup?: {
            multiPageMenuRenderer?: {
              header?: {
                activeAccountHeaderRenderer?: {
                  accountName?: { runs?: Array<{ text?: string }> }
                  accountPhoto?: { thumbnails?: Array<{ url?: string }> }
                }
              }
            }
          }
        }
      }>
    }

    const header =
      data.actions?.[0]?.openPopupAction?.popup?.multiPageMenuRenderer?.header
        ?.activeAccountHeaderRenderer
    const name = header?.accountName?.runs?.[0]?.text ?? 'YouTube Music'
    const avatarUrl = header?.accountPhoto?.thumbnails?.at(-1)?.url ?? null

    return { signedIn: true, name, avatarUrl }
  } catch {
    return { signedIn: true, name: 'YouTube Music', avatarUrl: null }
  }
}

export function openSignInWindow(): Promise<ProfileInfo> {
  return new Promise((resolve) => {
    if (authWindow) {
      authWindow.focus()
      return
    }

    authWindow = new BrowserWindow({
      width: 980,
      height: 720,
      title: 'Sign in to YouTube Music',
      autoHideMenuBar: true,
      webPreferences: {
        partition: PARTITION,
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    void authWindow.loadURL(MUSIC_URL)

    const finish = async () => {
      const profile = await getProfile()
      if (profile.signedIn) {
        authWindow?.close()
        resolve(profile)
      }
    }

    authWindow.webContents.on('did-navigate', () => {
      void finish()
    })
    authWindow.webContents.on('did-navigate-in-page', () => {
      void finish()
    })

    authWindow.on('closed', () => {
      authWindow = null
      void getProfile().then(resolve)
    })
  })
}

export async function signOut(): Promise<ProfileInfo> {
  await getYtmSession().clearStorageData()
  void shell.openExternal('https://accounts.google.com/Logout')
  return { signedIn: false, name: null, avatarUrl: null }
}
