export const createDocument = async (title: string = "Untitled Document") => {
    const res = await fetch('/api/documents/create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title })
    })

    if(!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create document.")
    }

    return await res.json()
}

export const getDocuments = async (skip: number = 0, take: number = 10) => {
    const res = await fetch(`/api/documents/?skip=${skip}&take=${take}`, {
        method: "GET",
    })

    if(!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch documents.")
    }

    return await res.json()
}