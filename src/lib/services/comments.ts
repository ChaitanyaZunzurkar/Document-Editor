export const createComment = async (threadId: string, content: string) => {
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
