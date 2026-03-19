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
    const res = await fetch(`/api/documents?skip=${skip}&take=${take}`, {
        method: "GET",
    })

    if(!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch documents.")
    }

    return await res.json()
}

export const deleteDocument = async (id: string) => {
  const response = await fetch(`/api/documents/delete/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete");
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return null; 
};

export const updateDocument = async(id: string, title: string) => {
    const res = await fetch(`/api/documents/update/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title })
    })

    if(!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete documents.")
    }

    return await res.json()
}

export const addCollaborator = async (
    documentId: string, 
    emails: string[], 
    role: string = "VIEWER"
) => {
    try {
        const response = await fetch("/api/documents/collaborators/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                documentId,
                emails,
                role,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add collaborators");
        }

        return data; 
    } catch (error) {
        console.error("Fail to add collaborator", error);
        throw error;
    }
};

export const getDocumentById = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents/${id}`, {
        method: "GET",
        cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch document");
    return await res.json();
};

export const searchDocument = async (query: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to search documents");
    return await res.json();
};

export const updateDocumentAccess = async (documentId: string, isPublic: boolean) => {
    const res = await fetch(`/api/documents/access`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, isPublic })
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update document access.");
    }

    return await res.json();
};