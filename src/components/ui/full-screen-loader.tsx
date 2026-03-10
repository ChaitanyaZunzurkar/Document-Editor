import { LoaderIcon } from "lucide-react"

interface FullScreenLoader {
    label?: string,
    className?: string
}

export const FullScreenLoader = ({ label, className} : FullScreenLoader) => {
    return (
        <div className="flex items-center justify-center min-h-screen flex-col gap-2">
            <LoaderIcon className="size-6 text-muted-foreground animate-spin" />
            { label && <p className="text-sm text-muted-foreground">{ label }</p>}
        </div>
    )
}