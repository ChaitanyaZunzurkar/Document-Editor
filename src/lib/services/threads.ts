// Fetch all active threads for a specific document
export const getThreads = async (documentId: string) => {
    const res = await fetch(`/api/threads?documentId=${documentId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch threads.");
    }

    return await res.json();
};

// Start a new thread (Highlight + First Comment)
export const createThread = async (documentId: string, quote: string, initialComment: string) => {
    const res = await fetch(`/api/threads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, quote, initialComment })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create thread.");
    }

    return await res.json();
};

// Reply to an existing thread
export const addCommentToThread = async (threadId: string, content: string) => {
    const res = await fetch(`/api/threads/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ threadId, content })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to add comment.");
    }

    return await res.json();
};

// Mark a thread as resolved (hide it)
export const resolveThread = async (threadId: string) => {
    const res = await fetch(`/api/threads`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ threadId, resolved: true })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to resolve thread.");
    }

    return await res.json();
};