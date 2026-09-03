import { useCallback, useEffect, useState } from "react";

/**
 * Loads data from a service function and exposes loading / error / retry.
 * Keeps pages simple: const { data, loading, error, reload } = useApiData(fn).
 */
export function useApiData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loader();
      setData(response?.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await run();
    })();
    return () => {
      cancelled = true;
    };
  }, [run]);

  return { data, loading, error, reload: run };
}
