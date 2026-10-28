// Turns an API response into data, or throws an Error with a readable message.
// The API always answers errors as { error: { code, message, details? } }.
const handleResponse = async (response) => {
    if (!response.ok) {
        let body = null;
        try {
            body = await response.json();
        } catch {
            // not JSON (e.g. a proxy error page)
        }

        const apiError = body?.error;
        const message = apiError?.details?.length
            ? apiError.details.join("\n")
            : apiError?.message || "Something went wrong, please try again";

        const error = new Error(message);
        error.status = response.status;
        error.code = apiError?.code;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export default handleResponse;
