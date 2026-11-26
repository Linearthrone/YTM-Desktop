import { globalShortcut } from 'electron'
import { setSettings } from './store'

const PRIMARY = 'Meta+Y'
const FALLBACK = 'Control+Shift+Y'

let registered: string = FALLBACK

export function getRegisteredHotkey(): string {
  return registered
}

export function registerHotkey(onToggle: () => void): string {
  globalShortcut.unregisterAll()

  if (globalShortcut.register(PRIMARY, onToggle)) {
    registered = PRIMARY
  } else if (globalShortcut.register(FALLBACK, onToggle)) {
    registered = FALLBACK
  } else {
    registered = 'unregistered'
  }

  setSettings({ hotkey: registered })
  return registered
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll()
}
