"use client"; 

import Link from "next/link";
import Image from "next/image";
import { Menu, Settings, Grid2X2, List } from "lucide-react";
import { SearchInput } from "./search-input";

export const Navbar = () => {
  return (
    <nav className="h-full w-full sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      
      {/* Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3 shrink-0 pr-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={36} height={36} />
          <h3 className="text-xl font-medium text-[#5F6368]">Docs</h3>
        </Link>
      </div>

      {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Menu className="w-6 h-6 text-[#5F6368]" />
      </button> */}

      {/* Search Bar */}
      <SearchInput />
      
      {/* User Actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center mr-4">
           {/* You can toggle these based on state */}
           <button className="p-2 rounded-full hover:bg-gray-100 hidden md:block">
            <Grid2X2 className="w-5 h-5 text-[#5F6368]" />
          </button>
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings className="w-5 h-5 text-[#5F6368]" />
        </button>

        <div className="ml-2 h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer border border-transparent hover:border-indigo-200 transition-all">
          JD
        </div>
      </div>
    </nav>
  );
};