import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

// <img src> can't send an Authorization header, so this fetches the
// protected photo as a blob and exposes it as a local object URL instead.
export function useAuthenticatedImage(path: string | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setObjectUrl(null);
      return;
    }

    let cancelled = false;
    let url: string | null = null;
    const token = localStorage.getItem("him_token");

    fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => {
        if (!cancelled) setObjectUrl(null);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [path]);

  return objectUrl;
}
