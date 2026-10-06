import { ChangeEvent } from "react";
import { UserProfile } from "@domain/task";

interface ProfileUIProps {
  profile:     UserProfile | null;
  loading:     boolean;
  error:       string | null;
  pictureFile: File | undefined;
  previewUrl:  string | undefined;
  isSaving:    boolean;
  saveError:   string | null;
  onChangePictureFile: (file: File | undefined) => void;
  onSavePicture:       () => void;
  onRemovePicture:     () => void;
  onBack:              () => void;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:   "Activo",
  INACTIVE: "Inactivo",
  BLOCKED:  "Bloqueado",
};

function ProfileUI({
  profile, loading, error,
  pictureFile, previewUrl, isSaving, saveError,
  onChangePictureFile, onSavePicture, onRemovePicture,
  onBack,
}: ProfileUIProps) {
  const initials  = (profile?.fullName ?? "?").slice(0, 2).toUpperCase();
  const avatarSrc = previewUrl ?? profile?.profilePictureUrl;

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    onChangePictureFile(e.target.files?.[0]);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gh-surface flex flex-col">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-gh-border flex-shrink-0">
        <button onClick={onBack} className="text-sm text-gh-muted hover:text-gh-text transition-colors">
          ← Volver al tablero
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md bg-[#161b22] border border-gh-border rounded-lg p-6">
          <h1 className="text-lg font-semibold text-gh-text mb-6">Mi perfil</h1>

          {loading && <p className="text-sm text-gh-muted">Cargando perfil…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {profile && !loading && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-500 text-white text-xl font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gh-text truncate">{profile.fullName}</p>
                  <p className="text-xs text-gh-muted truncate">@{profile.userAccount}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gh-muted">Imagen de perfil</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs px-3 py-1.5 rounded-md border border-gh-border text-gh-text hover:bg-gh-card transition-colors">
                    Elegir archivo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                      disabled={isSaving}
                    />
                  </label>
                  {pictureFile && (
                    <span className="text-xs text-gh-muted truncate max-w-[140px]">{pictureFile.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={onSavePicture}
                    disabled={!pictureFile || isSaving}
                    className="text-xs px-3 py-1.5 rounded-md bg-brand-500 text-white disabled:opacity-50 hover:bg-brand-600 transition-colors"
                  >
                    {isSaving ? "Guardando…" : "Guardar imagen"}
                  </button>
                  {profile.profilePictureUrl && (
                    <button
                      onClick={onRemovePicture}
                      disabled={isSaving}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-400/40 text-red-400 disabled:opacity-50 hover:bg-red-500/10 transition-colors"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>

                {saveError && <p className="text-xs text-red-400">{saveError}</p>}
              </div>

              <div className="border-t border-gh-border pt-4 flex flex-col gap-2">
                {profile.email && <ProfileField label="Correo" value={profile.email} />}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gh-muted">{label}</span>
      <span className="text-gh-text truncate max-w-[220px] text-right">{value}</span>
    </div>
  );
}

export { ProfileUI };
