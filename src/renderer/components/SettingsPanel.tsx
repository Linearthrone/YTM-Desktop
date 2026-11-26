import type { AppSettings, ThemeId } from '@shared/types'

interface Props {
  settings: AppSettings
  onClose: () => void
}

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'neon-red', label: 'Neon Red' },
  { id: 'neon-cyan', label: 'Neon Cyan' },
  { id: 'neon-violet', label: 'Neon Violet' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'mono', label: 'Mono' }
]

export function SettingsPanel({ settings, onClose }: Props) {
  return (
    <div className="settings-panel no-drag" role="dialog" aria-label="Settings">
      <h3>Settings</h3>
      <label>
        Color theme
        <select
          value={settings.theme}
          onChange={(e) =>
            void window.ytm.setSettings({ theme: e.target.value as ThemeId })
          }
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.translucencyEnabled}
          onChange={(e) =>
            void window.ytm.setSettings({ translucencyEnabled: e.target.checked })
          }
        />
        Translucency
      </label>
      <label>
        Opacity ({settings.translucency}%)
        <input
          type="range"
          min={0}
          max={100}
          value={settings.translucency}
          disabled={!settings.translucencyEnabled}
          onChange={(e) =>
            void window.ytm.setSettings({ translucency: Number(e.target.value) })
          }
        />
      </label>
      <p className="hotkey-hint">Hotkey: {settings.hotkey || 'Meta+Y'}</p>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  )
}
