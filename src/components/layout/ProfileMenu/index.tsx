import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@context/authContext";
import { useProfileContext } from "@context/profileContext";

export function ProfileMenu() {
  const { user, signOut } = useAuthContext();
  const { profile, loading } = useProfileContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = (profile?.fullName ?? user?.userAccountRole)?.slice(0, 2).toUpperCase() ?? "?";

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

  const handleViewProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center overflow-hidden"
      >
        {profile?.profilePictureUrl ? (
          <img src={profile.profilePictureUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-64 rounded-lg border border-gh-border bg-[#161b22] shadow-xl py-1">
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              {profile ? (
                <>
                  <p className="text-sm font-semibold text-gh-text truncate">{profile.fullName}</p>
                  {profile.email && (
                    <p className="text-[11px] text-gh-muted truncate">{profile.email}</p>
                  )}
                </>
              ) : (
                <span className="text-xs text-gh-muted">{loading ? "Cargando…" : user?.userAccountRole}</span>
              )}
            </div>
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
        </div>
      )}
    </div>
  );
}
