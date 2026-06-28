import { useState, useEffect, useRef } from "react";
import { BoardContext, apiBoardToBoardContext } from "@domain/board";
import { searchAllBoards } from "@services/searchAllBoards";
import { useHeaders } from "@hooks/useHeaders";

interface UseBoardResult {
  board:   BoardContext | null;
  loading: boolean;
  error:   string | null;
}

export function useBoard(): UseBoardResult {
  const [board,   setBoard]   = useState<BoardContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const { getHeaders } = useHeaders();
  const getHeadersRef  = useRef(getHeaders);
  getHeadersRef.current = getHeaders;

  useEffect(() => {
    let cancelled = false;

    const fetchBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        const boards = await searchAllBoards(getHeadersRef.current());
        if (!cancelled) {
          const active = boards.find((b) => b.boardStatus === "Active") ?? boards[0];
          setBoard(active ? apiBoardToBoardContext(active) : null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el tablero.");
          console.error("[useBoard] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBoard();
    return () => { cancelled = true; };
  }, []);

  return { board, loading, error };
}
