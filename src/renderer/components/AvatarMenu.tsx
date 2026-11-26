import type { ProfileInfo } from '@shared/types'

interface Props {
  profile: ProfileInfo
  open: boolean
  onToggle: () => void
  onOpenSettings: () => void
}

export function AvatarMenu({ profile, open, onToggle, onOpenSettings }: Props) {
  return (
    <>
      <button
        type="button"
        className="neon-chip avatar-btn"
        aria-label="Account menu"
        onClick={onToggle}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" />
        ) : (
          <div className="avatar-placeholder">
            {profile.signedIn ? (profile.name?.[0] ?? 'Y') : '?'}
          </div>
        )}
      </button>
      {open && (
        <div className="menu-pop no-drag" role="menu">
          {profile.signedIn ? (
            <>
              <div style={{ padding: '8px 12px', fontSize: 12, opacity: 0.7 }}>
                {profile.name}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => void window.ytm.signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => void window.ytm.signIn()}
            >
              Sign in to YouTube Music
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenSettings()
              onToggle()
            }}
          >
            Settings
          </button>
        </div>
      )}
    </>
  )
}
