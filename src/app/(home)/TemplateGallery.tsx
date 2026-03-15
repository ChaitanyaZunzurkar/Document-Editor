"use client"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useRouter } from "next/navigation"; 
import { useTransition } from "react";
import { templates } from "@/constants/template";
import { cn } from "@/lib/utils"
import { createDocument } from "@/lib/services/documents";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export const TemplateGallery = () => {
    const router = useRouter();
    const [isCreating, startTransition] = useTransition();

    const onCreate = (label: string) => {
        startTransition(async () => {
            try {
                const newDocs = await createDocument(label);

                toast.success("Document created successfully!");

                router.refresh();
                router.push(`/documents/${newDocs.id}`)
            } catch (error) {
                toast.error("Failed to create document. Please try again.");
                console.error(error);
            }
        })
    }

    if (isCreating) {
        return <FullScreenLoader label="Creating document..." />;
    }
    
    return (
    <div className="bg-[#F1F3F4]">
        <div className="max-w-screen-xl mx-auto px-16 py-6 flex flex-col gap-y-4">
            <h3 className="text-base font-medium">
                Start a new Document
            </h3>
            <Carousel>
                <CarouselContent className="-ml-4">
                    {templates.map((template) => (
                        <CarouselItem 
                            key={template.id}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.28%] pl-4"
                        >
                            <div
                                className={cn(
                                    "aspect-[3/4] flex flex-col gap-y-2.5",
                                    isCreating && "pointer-events-none opacity-50"
                                )}
                            >
                                <button
                                    disabled={isCreating}
                                    onClick={() => onCreate(template.label)}
                                    style={{
                                        backgroundImage: `url(${template.imageUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    className="size-full hover:border-blue-500 rounded-sm hover:bg-blue-50 transition flex flex-col items-center justify-center gap-y-4 bg-white"
                                >
                                    {isCreating && (
                                        <Loader2Icon className="size-6 text-blue-600 animate-spin" />
                                    )}
                                </button>
                                <p className="text-sm font-medium truncate flex items-center justify-center">
                                    {template.label}
                                </p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    </div>
  )
}

