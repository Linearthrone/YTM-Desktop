import Store from 'electron-store'
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types'

const store = new Store<{ settings: AppSettings }>({
  name: 'ytm-desktop',
  defaults: {
    settings: DEFAULT_SETTINGS
  }
})

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...store.get('settings') }
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial }
  store.set('settings', next)
  return next
}
