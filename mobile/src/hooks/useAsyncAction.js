import { useCallback, useState } from "react";

// Runs an async action (submit, delete...), tracking `pending` so buttons can
// be disabled, and reporting failures through setError.
const useAsyncAction = (setError) => {
    const [pending, setPending] = useState(false);

    const run = useCallback(async (action) => {
        try {
            setPending(true);
            setError("");
            await action();
        } catch (err) {
            setError(err.message);
        } finally {
            setPending(false);
        }
    }, [setError]);

    return { run, pending };
};

export default useAsyncAction;
