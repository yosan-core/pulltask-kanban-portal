import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { UserProfile, ProfilePictureOperation } from "@domain/task";
import { useAuthContext } from "@context/authContext";
import { getUserProfile } from "@services/getUserProfile";
import { updateProfilePicture as updateProfilePictureService } from "@services/updateProfilePicture";

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error:   string | null;
  updateProfilePicture: (file: File | undefined, operation: ProfilePictureOperation) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setError(null);
    getUserProfile(user.userAccountId, { Authorization: `Bearer ${user.token}` })
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar el perfil."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user]);

  // Fuente única del perfil: la actualiza acá para que el header (ProfileMenu)
  // y la página /profile queden sincronizados sin recargar la app.
  const updateProfilePicture = useCallback(async (file: File | undefined, operation: ProfilePictureOperation) => {
    if (!user) return;
    await updateProfilePictureService(
      { userAccountId: user.userAccountId, profilePicture: file, operation },
      { Authorization: `Bearer ${user.token}` },
    );
    // La respuesta de la escritura (persistence) trae el objectName crudo,
    // no una URL utilizable en un <img> — la URL firmada solo la genera el
    // lado de consulta (query), así que volvemos a pedir el perfil para
    // tener ya la URL lista para mostrar.
    const refreshed = await getUserProfile(user.userAccountId, { Authorization: `Bearer ${user.token}` });
    setProfile(refreshed);
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfilePicture }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext must be used within ProfileProvider");
  return ctx;
}
