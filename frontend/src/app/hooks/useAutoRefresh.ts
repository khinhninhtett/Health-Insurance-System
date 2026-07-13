import { useEffect, useRef } from "react";

// Silently re-runs a load function on an interval and when the window regains
// focus, so pages reflect data changes made elsewhere (admin ↔ customer)
// without a manual refresh. The callback must not toggle loading spinners.
export function useAutoRefresh(refresh: () => void, intervalMs = 10000) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) refreshRef.current();
    };
    const id = setInterval(tick, intervalMs);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, [intervalMs]);
}
