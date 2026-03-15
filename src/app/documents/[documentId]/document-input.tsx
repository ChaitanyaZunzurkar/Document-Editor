"use client"; 

import { Input } from '@/components/ui/input';
import { updateDocument } from '@/lib/services/documents';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DocumentInputProps {
    initialTitle: string;
}

export const DocumentInput = ({ initialTitle }: DocumentInputProps) => {
    const params = useParams();
    const documentId = params.documentId as string;
    
    const [title, setTitle] = useState(initialTitle || "Untitled Document");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(initialTitle || "Untitled Document");
    }, [initialTitle]);

    const handleSave = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || trimmedTitle === initialTitle) {
            setTitle(initialTitle || "Untitled Document");
            toast.error("Document title cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            await updateDocument(documentId, trimmedTitle);
        } catch(error) {
            console.error(error);
            setTitle(initialTitle);
            toast.error("Failed to update title");
        } finally {
            setIsSaving(false);
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) =>  {
        e.preventDefault();
        handleSave();
        (document.activeElement as HTMLElement)?.blur();
    };

    return (
        <div className="flex items-center gap-2">
            <form onSubmit={onSubmit} className="relative flex items-center">
                <Input
                    type="text"
                    value={title}
                    disabled={isSaving}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    className="
                        h-8 px-2 text-lg font-medium text-slate-900 
                        bg-transparent border-transparent shadow-none
                        cursor-text transition-colors rounded-sm
                        hover:bg-slate-100 hover:border-transparent
                        focus:bg-white focus:border-blue-500 focus:shadow-sm
                        focus-visible:ring-0 focus-visible:ring-offset-0
                        max-w-[150px] sm:max-w-[250px] md:max-w-[400px] truncate
                    "
                />
                <button type="submit" className="hidden">Save</button>
            </form>
            
            {isSaving && (
                <span className="text-xs text-slate-500 font-medium ml-1">
                    Saving...
                </span>
            )}
        </div>
    );
}