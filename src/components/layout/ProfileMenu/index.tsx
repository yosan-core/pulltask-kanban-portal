import { useEffect, useRef, useState } from "react";
import { UserProfile } from "@domain/task";
import { useAuthContext } from "@context/authContext";
import { getUserProfile } from "@services/getUserProfile";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:   "Activo",
  INACTIVE: "Inactivo",
  BLOCKED:  "Bloqueado",
};

export function ProfileMenu() {
  const { user, signOut } = useAuthContext();
  const [open,    setOpen]    = useState(false);
  const [view,    setView]    = useState<"menu" | "profile">("menu");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user?.userAccountRole?.slice(0, 2).toUpperCase() ?? "?";

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (!open) setView("menu");
  }, [open]);

  const handleViewProfile = () => {
    setView("profile");
    if (profile || !user) return;

    setLoading(true);
    setError(null);
    getUserProfile(user.userAccountId, { Authorization: `Bearer ${user.token}` })
      .then(setProfile)
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-64 rounded-lg border border-gh-border bg-[#161b22] shadow-xl py-1">
          {view === "menu" ? (
            <>
              <div className="px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
                <span className="text-xs text-gh-muted">{user?.userAccountRole}</span>
              </div>

              <div className="border-t border-gh-border my-1" />

              <button
                onClick={handleViewProfile}
                className="w-full text-left px-3 py-1.5 text-sm text-gh-text hover:bg-gh-card flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gh-muted flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                </svg>
                Ver perfil
              </button>

              <div className="border-t border-gh-border my-1" />

              <button
                onClick={signOut}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
                </svg>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView("menu")}
                className="w-full text-left px-3 py-1.5 text-xs text-gh-muted hover:text-gh-text flex items-center gap-1.5 transition-colors"
              >
                ← Volver
              </button>

              <div className="border-t border-gh-border my-1" />

              <div className="px-3 py-2">
                {loading && <p className="text-xs text-gh-muted">Cargando perfil…</p>}
                {error && <p className="text-xs text-red-400">{error}</p>}
                {profile && !loading && !error && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gh-text truncate">{profile.fullName}</p>
                        <p className="text-[11px] text-gh-muted truncate">@{profile.userAccount}</p>
                      </div>
                    </div>

                    {profile.email && (
                      <ProfileField label="Correo" value={profile.email} />
                    )}
                    <ProfileField label="Rol" value={profile.role} />
                    {profile.status && (
                      <ProfileField label="Estado" value={STATUS_LABEL[profile.status] ?? profile.status} />
                    )}
                    {profile.mainOriginatorName && (
                      <ProfileField label="Originador" value={profile.mainOriginatorName} />
                    )}
                    {profile.creationDate && (
                      <ProfileField label="Miembro desde" value={profile.creationDate} />
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gh-border my-1" />

              <button
                onClick={signOut}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
                </svg>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-gh-muted">{label}</span>
      <span className="text-gh-text truncate max-w-[160px] text-right">{value}</span>
    </div>
  );
}
