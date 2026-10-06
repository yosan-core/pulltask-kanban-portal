import { useState, useEffect, useRef, useCallback } from "react";
import { UserProfile } from "@domain/task";
import { useProfileContext } from "@context/profileContext";

interface UseProfileResult {
  profile:   UserProfile | null;
  loading:   boolean;
  error:     string | null;

  pictureFile: File | undefined;
  previewUrl:  string | undefined;
  isSaving:    boolean;
  saveError:   string | null;

  onChangePictureFile: (file: File | undefined) => void;
  onSavePicture:       () => Promise<void>;
  onRemovePicture:     () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { profile, loading, error, updateProfilePicture } = useProfileContext();

  const [pictureFile, setPictureFile] = useState<File | undefined>(undefined);
  const [previewUrl,  setPreviewUrl]  = useState<string | undefined>(undefined);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  // Solo libera el object URL vigente al desmontar (deps: []), nunca en cada
  // cambio de previewUrl — si dependiera de previewUrl, React (sobre todo en
  // StrictMode) puede revocar el blob recién creado antes de que el <img>
  // llegue a cargarlo, mostrando la imagen "rota".
  const previewUrlRef = useRef<string | undefined>(undefined);
  previewUrlRef.current = previewUrl;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const onChangePictureFile = useCallback((file: File | undefined) => {
    setPictureFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : undefined;
    });
    setSaveError(null);
  }, []);

  const onSavePicture = useCallback(async () => {
    if (!pictureFile) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfilePicture(pictureFile, "Update");
      onChangePictureFile(undefined);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo actualizar la imagen de perfil.");
    } finally {
      setIsSaving(false);
    }
  }, [pictureFile, updateProfilePicture, onChangePictureFile]);

  const onRemovePicture = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfilePicture(undefined, "Delete");
      onChangePictureFile(undefined);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo eliminar la imagen de perfil.");
    } finally {
      setIsSaving(false);
    }
  }, [updateProfilePicture, onChangePictureFile]);

  return {
    profile, loading, error,
    pictureFile, previewUrl, isSaving, saveError,
    onChangePictureFile, onSavePicture, onRemovePicture,
  };
}
