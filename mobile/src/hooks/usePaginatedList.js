import { useCallback, useEffect, useRef, useState } from "react";

// For endpoints that return { data, page, totalPages }: loads page 1, then
// more pages as the list scrolls (loadMore), and refresh() for pull-to-refresh.
// `fetchPage(page)` must be wrapped in useCallback; when it changes (e.g. the
// filters changed) the list starts over from page 1.
const usePaginatedList = (fetchPage) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    // ignores answers from an older request (filters changed while loading)
    const requestId = useRef(0);

    const loadFirstPage = useCallback(async () => {
        const id = ++requestId.current;
        try {
            setError("");
            const result = await fetchPage(1);
            if (id === requestId.current) {
                setItems(result.data);
                setPage(1);
                setTotalPages(result.totalPages);
                setTotal(result.total);
            }
        } catch (err) {
            if (id === requestId.current) {
                setError(err.message);
            }
        }
    }, [fetchPage]);

    useEffect(() => {
        setLoading(true);
        loadFirstPage().finally(() => setLoading(false));
    }, [loadFirstPage]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await loadFirstPage();
        setRefreshing(false);
    }, [loadFirstPage]);

    const loadMore = useCallback(async () => {
        if (loading || loadingMore || page === 0 || page >= totalPages) {
            return;
        }

        const id = requestId.current;
        try {
            setLoadingMore(true);
            const result = await fetchPage(page + 1);
            if (id === requestId.current) {
                setItems((prev) => [...prev, ...result.data]);
                setPage(result.page);
                setTotalPages(result.totalPages);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, loading, loadingMore, page, totalPages]);

    return { items, total, loading, refreshing, loadingMore, error, refresh, loadMore };
};

export default usePaginatedList;
