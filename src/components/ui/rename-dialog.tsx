"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RenameDialogProps {
  documentId: string;
  initialTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export const RenameDialog = ({
  documentId,
  initialTitle,
  isOpen,
  onClose,
  onRename
}: RenameDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title === initialTitle) return onClose();

    setIsUpdating(true);
    try {
      await onRename(documentId, title);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>
            Enter a new name for this document.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              disabled={isUpdating}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-black text-white"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !title.trim()}
              className="bg-blue-600"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};