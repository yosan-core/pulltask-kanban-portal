import { useState, useEffect, useRef, useCallback } from "react";
import type { ProjectMember } from "@domain/projectMember";
import { searchProjectMembers } from "@services/searchProjectMembers";
import { searchUserProfiles } from "@services/searchUserProfiles";
import { useHeaders } from "@hooks/useHeaders";

interface UseProjectMembersResult {
  members: ProjectMember[];
  loading: boolean;
  error:   string | null;
  reload:  () => void;
}

// Members of the project with their name and picture: task-board says who is a member,
// and auth returns the public profile of exactly those users.
export function useProjectMembers(projectId: string | undefined): UseProjectMembersResult {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const { getHeaders } = useHeaders();
  const getHeadersRef  = useRef(getHeaders);
  getHeadersRef.current = getHeaders;

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers    = getHeadersRef.current();
        const apiMembers = await searchProjectMembers(projectId, headers);
        const profiles   = await searchUserProfiles(apiMembers.map((m) => m.userId), {
          Authorization: headers.Authorization,
        });
        if (cancelled) return;

        const profileById = new Map(profiles.map((p) => [p.userAccountId, p]));
        setMembers(apiMembers.map((m) => {
          const profile = profileById.get(m.userId);
          return {
            projectMemberId:   m.projectMemberId,
            projectId:         m.projectId,
            userId:            m.userId,
            role:              m.memberRole,
            invitedBy:         m.invitedBy,
            joinedAt:          m.joinedAt,
            fullName:          profile?.fullName || "Usuario",
            profilePictureUrl: profile?.profilePictureUrl,
          };
        }));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar los miembros.");
          console.error("[useProjectMembers] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMembers();
    return () => { cancelled = true; };
  }, [projectId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { members, loading, error, reload };
}
