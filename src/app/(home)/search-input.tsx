"use client";

import { Button } from "@/components/ui/button";
import { Search, XIcon } from "lucide-react";
import { useRef, useState } from "react";

export const SearchInput = () => {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

    const handleClear = () => {
        setValue("")
        inputRef.current?.blur()
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Searching for:", value);
        // TODO: add a backend api to search documents 
    };

    return (
        <div className="flex-1 max-w-[720px] px-8">
            <form onSubmit={handleSubmit} className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                </div>

                <input
                    type="text"
                    placeholder="Search"
                    value={value}
                    onChange={handleChange}
                    ref={inputRef}
                    className="block w-full pl-12 pr-10 py-2.5 bg-[#F1F3F4] border-transparent focus:bg-white focus:outline-none focus:ring-0 focus:shadow-md transition-all sm:text-sm placeholder-gray-500 text-gray-900 rounded-full"
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
            </form>
        </div>
    )
}