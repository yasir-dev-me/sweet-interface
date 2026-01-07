import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Trash2, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CardItemProps {
  card: Card;
  onUpdate: (cardId: number, content: string) => Promise<void>;
  onDelete: (cardId: number) => Promise<void>;
}

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [content, setContent] = useState(card.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef(card.content);

  useEffect(() => {
    setContent(card.content);
    lastSavedContent.current = card.content;
  }, [card.content]);

  const handleSave = async (newContent: string) => {
    if (newContent === lastSavedContent.current) return;
    
    try {
      setIsSaving(true);
      await onUpdate(card.id, newContent);
      lastSavedContent.current = newContent;
      setHasChanges(false);
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'Could not save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== lastSavedContent.current);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1500);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(card.id);
    } catch (err) {
      toast({
        title: 'Failed to delete',
        description: err instanceof Error ? err.message : 'Could not delete card',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/30">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {card.user_name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{card.user_name}</span>
            </div>
          )}
          <span>{formatDate(card.updated_at)}</span>
          {isSaving && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {hasChanges && !isSaving && (
            <span className="text-primary animate-pulse">Unsaved</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyContent}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <Textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Write something..."
        className="min-h-[120px] font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 leading-relaxed"
      />

      {/* Character count */}
      <div className="px-4 py-1.5 text-xs text-muted-foreground bg-secondary/20 border-t border-border">
        {content.length.toLocaleString()} characters
      </div>
    </div>
  );
}
