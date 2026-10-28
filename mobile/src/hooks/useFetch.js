import { useCallback, useEffect, useState } from "react";

// Loads data once when the screen opens, and gives back `reload` for
// pull-to-refresh. Pass a function wrapped in useCallback, or a function
// defined outside the component, so it doesn't re-run on every render.
const useFetch = (fetchFn, initialData = null) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setData(await fetchFn());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                const result = await fetchFn();
                if (!cancelled) {
                    setData(result);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            cancelled = true;
        };
    }, [fetchFn]);

    return { data, loading, error, setError, reload };
};

export default useFetch;
