import { auth, signIn, signOut } from '@/auth'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export const AuthButton = async () => {
    const session = await auth();

    if (session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-200 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {session.user?.image ? (
                            <Image 
                                src={session.user.image}
                                alt={session.user.name ?? "User"}
                                fill 
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                                {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
                            </div>
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                            className="w-full"
                        >
                            <button 
                                type="submit" 
                                className="flex w-full items-center gap-2 text-red-600 font-medium"
                            >
                                <LogOut className="size-4" />
                                Sign Out
                            </button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <form
            action={async () => {
                "use server"
                await signIn("google");
            }}
        >
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Sign In
            </Button>
        </form>
    )
}