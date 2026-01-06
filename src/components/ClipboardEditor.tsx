import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, Link, Clock, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api, Clipboard } from '@/lib/api';

interface ClipboardEditorProps {
  clipboardId: string;
}

export function ClipboardEditor({ clipboardId }: ClipboardEditorProps) {
  const [content, setContent] = useState('');
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  // Fetch clipboard content
  useEffect(() => {
    const fetchClipboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getClipboard(clipboardId);
        setClipboard(data);
        setContent(data.content);
        lastSavedContent.current = data.content;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clipboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClipboard();
  }, [clipboardId]);

  // Auto-save with debounce
  const saveContent = useCallback(async (newContent: string) => {
    if (newContent === lastSavedContent.current) return;
    
    try {
      setIsSaving(true);
      const data = await api.updateClipboard(clipboardId, newContent);
      setClipboard(data);
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
  }, [clipboardId, toast]);

  // Handle content change with debounced auto-save
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== lastSavedContent.current);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (1.5 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newContent);
    }, 1500);
  };

  // Copy content to clipboard
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
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

  // Copy shareable link
  const copyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: 'Link copied!',
        description: 'Share this link with anyone',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link',
        variant: 'destructive',
      });
    }
  };

  // Manual save
  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveContent(content);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading clipboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Clipboard not found</h2>
          <p className="text-muted-foreground max-w-md">
            This clipboard doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="mt-2"
          >
            Create new clipboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
            <span className="font-mono text-sm text-muted-foreground">ID:</span>
            <span className="font-mono text-sm text-foreground">{clipboardId.slice(0, 8)}...</span>
          </div>
          {clipboard?.updated_at && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(clipboard.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className="flex items-center gap-2 mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : hasChanges ? (
              <span className="text-sm text-primary animate-pulse-subtle">Unsaved changes</span>
            ) : (
              <span className="text-sm text-muted-foreground">All changes saved</span>
            )}
          </div>

          {/* Action buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving || !hasChanges}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyContent}
            className="gap-1.5"
          >
            {copiedContent ? (
              <>
                <Check className="w-4 h-4 text-success" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={copyLink}
            className="gap-1.5"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                <span className="hidden sm:inline">Share Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing or paste your content here...

Share this clipboard with anyone by copying the link above.
Changes are saved automatically."
          className="min-h-[60vh] font-mono text-sm resize-none bg-card border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 p-6 leading-relaxed"
        />
        
        {/* Character count */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
          {content.length.toLocaleString()} characters
        </div>
      </div>
    </div>
  );
}
