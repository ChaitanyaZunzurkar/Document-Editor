"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2Icon, ShieldCheck, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Make sure you export both of these server actions from your services file!
import { addCollaborator, updateDocumentAccess } from "@/lib/services/documents"; 

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

interface Collaborator {
    id: string;
    role: string;
    user: User;
    userId: string;
}

interface AddCollaboratorsProps {
  documentId: string;
  title: string;
  initialCollaborators: Collaborator[];
  ownerId: string;
  initialIsPublic: boolean; // 👈 NEW PROP
}

export const AddCollaborators = ({ 
    documentId, 
    title, 
    initialCollaborators,
    ownerId,
    initialIsPublic
}: AddCollaboratorsProps) => {
  const [inputValue, setInputValue] = useState("");
  const [role, setRole] = useState("VIEWER"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  
  // State for General Access
  const [isPublicAccess, setIsPublicAccess] = useState(initialIsPublic);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  // Keep state in sync if props change
  useEffect(() => {
    setCollaborators(initialCollaborators);
    setIsPublicAccess(initialIsPublic);
  }, [initialCollaborators, initialIsPublic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emails = inputValue
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email !== "" && email.includes("@"));

    if (emails.length === 0) return;

    setIsSubmitting(true);

    try {
      const updatedData = await addCollaborator(documentId, emails, role);
      setCollaborators(updatedData.collaborators);
      setInputValue("");
      toast.success("Collaborators added successfully");
    } catch (error) {
        console.error("Connection Error:", error);
        toast.error("Failed to add collaborators. Please check the emails.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublicToggle = async (value: string) => {
    const isNowPublic = value === "PUBLIC";
    setIsPublicAccess(isNowPublic);
    setIsUpdatingAccess(true);
    
    try {
      await updateDocumentAccess(documentId, isNowPublic);
      toast.success(isNowPublic ? "Link sharing turned on" : "Document restricted");
      
      // Automatically copy link to clipboard when made public
      if (isNowPublic) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to update access settings.");
      setIsPublicAccess(!isNowPublic); // Revert UI if the server fails
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-x-2 h-10 px-6 rounded-full border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
        >
          <span className="text-base font-medium text-gray-700">Share</span>
          <Globe className="size-5 text-blue-600 animate-pulse" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{title}"</DialogTitle>
          <DialogDescription>
            Add multiple people by separating emails with commas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add People Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <Label htmlFor="emails" className="text-xs font-bold uppercase text-gray-500">
                Add People
            </Label>
            <div className="flex gap-x-2">
                <Input 
                    id="emails" 
                    placeholder="person@gmail.com, person2@gmail.com" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#F1F3F4] border-none focus-visible:ring-1"
                />
                <Select 
                  value={role} 
                  onValueChange={setRole}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-[110px] bg-[#F1F3F4] border-none">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" disabled={isSubmitting || !inputValue.trim()}>
                    {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : "Add"}
                </Button>
            </div>
          </form>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-gray-500">
                General Access
            </Label>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-x-3">
                    <div className={`size-10 rounded-full flex items-center justify-center ${isPublicAccess ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <Globe className={`size-5 ${isPublicAccess ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">
                            {isPublicAccess ? "Anyone with the link" : "Restricted"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isPublicAccess 
                                ? "Anyone on the internet with the link can view" 
                                : "Only people with access can open"}
                        </p>
                    </div>
                </div>
                
                <Select 
                  value={isPublicAccess ? "PUBLIC" : "RESTRICTED"} 
                  onValueChange={handlePublicToggle}
                  disabled={isUpdatingAccess}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESTRICTED">Restricted</SelectItem>
                    <SelectItem value="PUBLIC">Anyone with link</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          <Separator />

          {/* People with Access List */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-gray-500">
                People with access
            </Label>
            <ScrollArea className="h-[140px] w-full pr-4">
              <div className="flex flex-col gap-y-4">
                {collaborators?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3 overflow-hidden">
                      <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                        {c.user?.name?.[0] || c.user?.email?.[0] || "?"}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium truncate">
                            {c.user?.name || "Pending User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {c.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                      <ShieldCheck className="size-3" />
                      {c.userId === ownerId ? "OWNER" : c.role}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center mt-2">
          <Button 
            type="button" 
            variant="ghost" 
            className="gap-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={copyLink}
          >
            <LinkIcon className="size-4" />
            Copy link
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};