import { useNavigate } from "react-router-dom";
import { useProfile } from "@hooks/useProfile";
import { ProfileUI } from "./interface";

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile, loading, error,
    pictureFile, previewUrl, isSaving, saveError,
    onChangePictureFile, onSavePicture, onRemovePicture,
  } = useProfile();

  return (
    <ProfileUI
      profile={profile}
      loading={loading}
      error={error}
      pictureFile={pictureFile}
      previewUrl={previewUrl}
      isSaving={isSaving}
      saveError={saveError}
      onChangePictureFile={onChangePictureFile}
      onSavePicture={onSavePicture}
      onRemovePicture={onRemovePicture}
      onBack={() => navigate("/board")}
    />
  );
}
