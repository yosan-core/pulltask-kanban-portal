import { useState, useEffect, useRef } from "react";
import { UserProfile } from "@domain/task";
import { searchAllUsers } from "@services/searchAllUsers";
import { useHeaders } from "@hooks/useHeaders";

interface UseUsersResult {
  usersByName: Map<string, UserProfile>;
}

export function useUsers(): UseUsersResult {
  const [usersByName, setUsersByName] = useState<Map<string, UserProfile>>(new Map());

  const { getHeaders } = useHeaders();
  const getHeadersRef = useRef(getHeaders);
  getHeadersRef.current = getHeaders;

  useEffect(() => {
    let cancelled = false;

    searchAllUsers({ Authorization: getHeadersRef.current().Authorization })
      .then((users) => {
        if (cancelled) return;
        setUsersByName(new Map(users.map((u) => [u.fullName, u])));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return { usersByName };
}
