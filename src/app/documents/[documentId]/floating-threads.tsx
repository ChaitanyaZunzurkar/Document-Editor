"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlusIcon, SendIcon, CheckCircle2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getThreads, addCommentToThread, resolveThread, createThread } from "@/lib/services/threads";

interface FloatingThreadsProps {
  editor: any;
  documentId: string;
}

export const FloatingThreads = ({ editor, documentId }: FloatingThreadsProps) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Draft State
  const [draftQuote, setDraftQuote] = useState("");
  const [draftText, setDraftText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await getThreads(documentId);
        setThreads(data);
      } catch (error) {
        console.error("Failed to fetch threads");
      }
    };
    fetchThreads();
  }, [documentId]);

  useEffect(() => {
    if (!editor) return;

    const calculatePositions = () => {
      const pageContainer = document.querySelector('.ProseMirror')?.parentElement;
      if (!pageContainer) return;

      const containerBounds = pageContainer.getBoundingClientRect();
      const newPositions: Record<string, number> = {};
      let foundDraft = false;

      const highlightElements = document.querySelectorAll('span[data-thread-id]');

      highlightElements.forEach((el) => {
        const threadId = el.getAttribute('data-thread-id');
        if (!threadId) return;

        // If we found the draft created by the Toolbar, grab its text!
        if (threadId === "draft") {
            foundDraft = true;
            if (draftQuote !== el.textContent) {
                setDraftQuote(el.textContent || "");
            }
        }

        const spanBounds = el.getBoundingClientRect();
        newPositions[threadId] = spanBounds.top - containerBounds.top;
      });

      if (!foundDraft && draftQuote) setDraftQuote(""); // Clear if it was deleted

      setPositions(newPositions);
    };

    editor.on('update', calculatePositions);
    editor.on('selectionUpdate', () => {
        if (editor.isActive("thread") && !editor.isActive("thread", { threadId: "draft" })) {
            setActiveThreadId(editor.getAttributes("thread").threadId);
        } else {
            setActiveThreadId(null);
        }
    });
    
    setTimeout(calculatePositions, 200);
    return () => { editor.off('update', calculatePositions); };
  }, [editor, threads, draftQuote]);


  // --- Helper to swap the "draft" highlight for a permanent one ---
  const updateDraftMark = (newId: string | null) => {
    let tr = editor.state.tr;
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.isText && node.marks) {
        const threadMark = node.marks.find((m: any) => m.type.name === 'thread' && m.attrs.threadId === 'draft');
        if (threadMark) {
          tr = tr.removeMark(pos, pos + node.nodeSize, threadMark.type);
          if (newId) {
            tr = tr.addMark(pos, pos + node.nodeSize, threadMark.type.create({ threadId: newId }));
          }
        }
      }
    });
    editor.view.dispatch(tr);
  };

  const cancelDraft = () => {
    updateDraftMark(null); // Removes the yellow highlight
    setDraftText("");
  };

  const submitDraft = async () => {
    if (!draftText.trim()) return;
    setIsSubmitting(true);
    try {
      const newThread = await createThread(documentId, draftQuote, draftText);
      updateDraftMark(newThread.id); // Swaps "draft" for the real Database ID
      setThreads([newThread, ...threads]);
      setDraftText("");
      setActiveThreadId(newThread.id);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to post comment");
      cancelDraft();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (threadId: string, content: string) => {
    try {
      const newComment = await addCommentToThread(threadId, content);
      setThreads(threads.map(t => t.id === threadId ? { ...t, comments: [...t.comments, newComment] } : t));
    } catch {
      toast.error("Failed to reply");
    }
  };

  const handleResolve = async (threadId: string) => {
    try {
      await resolveThread(threadId);
      setThreads(threads.filter(t => t.id !== threadId));
      toast.success("Thread resolved");
    } catch {
      toast.error("Failed to resolve thread");
    }
  };

  return (
    <>
      {(threads.length > 0 || positions["draft"] !== undefined) && (
        <div className="absolute top-0 left-full ml-4 w-[300px] h-full pointer-events-none z-50">
          
          {/* 1. The "New Comment" Draft Card */}
          {positions["draft"] !== undefined && (
            <div 
              className="absolute left-0 w-full bg-white p-4 rounded-xl shadow-lg border border-blue-400 ring-4 ring-blue-50 pointer-events-auto z-50 animate-in fade-in slide-in-from-right-4"
              style={{ top: `${positions["draft"]}px` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <MessageSquarePlusIcon className="size-4" />
                  New Comment
                </div>
                <button onClick={cancelDraft} className="text-gray-400 hover:text-red-500 transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 italic mb-3 border-l-2 border-blue-200 pl-2 bg-blue-50/50 py-1 pr-1 rounded-r truncate">
                "{draftQuote}"
              </p>
              
              <textarea
                autoFocus
                className="w-full text-sm resize-none outline-none placeholder:text-gray-400 mb-2 bg-transparent"
                placeholder="Type your comment..."
                rows={3}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />
              
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={cancelDraft}>Cancel</Button>
                <Button size="sm" onClick={submitDraft} disabled={!draftText.trim() || isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          )}

          {/* 2. Render Existing Saved Threads */}
          {threads.map((thread) => {
            const yPos = positions[thread.id];
            if (yPos === undefined) return null;

            return (
              <ThreadCard
                key={thread.id}
                thread={thread}
                yPos={yPos}
                isActive={activeThreadId === thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                onReply={(content: string) => handleReply(thread.id, content)}
                onResolve={() => handleResolve(thread.id)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

// --- SUB-COMPONENT: The Beautiful Chat UI Card ---
const ThreadCard = ({ thread, yPos, isActive, onClick, onReply, onResolve }: any) => {
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText("");
  };

  return (
    <div 
      onClick={onClick}
      className={`absolute left-0 w-full bg-white p-4 rounded-xl shadow-lg border transition-all duration-300 pointer-events-auto cursor-default ${
        isActive ? "border-blue-500 ring-2 ring-blue-100 z-40 scale-100" : "border-gray-200 z-10 scale-[0.98] hover:border-blue-300 opacity-80 hover:opacity-100"
      }`}
      style={{ top: `${yPos}px` }}
    >
      <p className="text-xs text-gray-500 italic mb-4 border-l-2 border-yellow-400 pl-2 bg-yellow-50/50 py-1 pr-1 rounded-r">
        "{thread.quote}"
      </p>

      <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-1">
        {thread.comments.map((comment: any) => (
          <div key={comment.id} className="flex gap-x-3">
            <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
              {comment.user?.name?.[0] || comment.user?.email?.[0] || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-800">{comment.user?.name || "Anonymous"}</span>
                <span className="text-[10px] text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="flex items-center gap-2 mt-2 pt-3 border-t animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="Reply..."
            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 focus:border-blue-300 transition-colors"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitReply() }}
          />
          {replyText.trim() ? (
            <Button size="icon" className="size-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white" onClick={submitReply}>
              <SendIcon className="size-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="size-8 text-gray-400 hover:text-green-600 rounded-full" onClick={onResolve} title="Resolve thread">
              <CheckCircle2Icon className="size-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};