import Link from "next/link";
import Image from "next/image";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/components/ui/auth-button";

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

      {/* Search Bar */}
      <SearchInput />
      
      { /* Sign In Button */}
      <AuthButton />
    </nav>
  );
};