"use client";

import { Button } from "@/components/ui/button";
import { searchDocument } from "@/lib/services/documents";
import { Search, UserIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiGoogledocs } from "react-icons/si";

interface SearchResult {
  id: string;
  title: string;
  owner: {
    name: string | null;
  };
}

export const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [docs, setDocs] = useState<SearchResult[]>([]);

    useEffect(() => {
        const delayFunction = setTimeout(async () => {
            if(value.trim().length >= 2) {
                try { 
                    setIsLoading(true)
                    const documents = await searchDocument(value);
                    setDocs(documents)
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setDocs([])
            }
        }, 300)

        return () => clearTimeout(delayFunction);
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

    const handleClear = () => {
        setValue("")
        inputRef.current?.blur()
        setDocs([])
    }

    const onSelect = (id: string) => {
        router.push(`/documents/${id}`);
        handleClear();
    };

    return (
        <div className="flex-1 max-w-[720px] px-8">
            <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                </div>

                <input
                    type="text"
                    placeholder="Search"
                    value={value}
                    onChange={handleChange}
                    ref={inputRef}
                    className="block w-full pl-12 pr-10 py-2.5 bg-[#F1F3F4] border-transparent focus:bg-slate-50 focus:outline-none focus:ring-0 focus:shadow-md transition-all sm:text-sm placeholder-gray-500 text-gray-900 rounded-full"
                />

                {value && (
                    <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 [&_svg]:size-5 rounded-full"
                    >
                        <XIcon />
                    </Button>
                )}
                
                <button type="submit" className="hidden" />
            </div>

            {value.length >= 2 && (
                <div className="absolute top-full left-8 right-8 bg-slate-50 rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {isLoading && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                    </div>
                )}
                
                {!isLoading && docs.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                    No documents found.
                    </div>
                )}

                {!isLoading && docs.length > 0 && (
                    <div className="flex flex-col p-2">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Recent Matches
                    </p>
                    {docs.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className="flex items-center gap-x-3 p-3 hover:bg-gray-100 rounded-md transition text-left"
                        >
                        <SiGoogledocs className="size-5 text-blue-500 flex-shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-x-1">
                            <UserIcon className="size-3" />
                            {doc.owner?.name || "Shared"}
                            </span>
                        </div>
                        </button>
                    ))}
                    </div>
                )}
                </div>
            )}
        </div>
    )
}