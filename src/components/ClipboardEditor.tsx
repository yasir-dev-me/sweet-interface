import { useState, useEffect, useCallback } from 'react';
import { Link, Clock, Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api, Clipboard, Card } from '@/lib/api';
import { CardItem } from './CardItem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClipboardEditorProps {
  clipboardId: string;
}

export function ClipboardEditor({ clipboardId }: ClipboardEditorProps) {
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isDeletingClipboard, setIsDeletingClipboard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCardContent, setNewCardContent] = useState('');
  const [userName] = useState(() => {
    const stored = localStorage.getItem('clipboard_username');
    if (stored) return stored;
    const randomName = `User${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem('clipboard_username', randomName);
    return randomName;
  });
  const { toast } = useToast();

  // Fetch clipboard content
  const fetchClipboard = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const data = await api.getClipboard(clipboardId);
      setClipboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clipboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [clipboardId]);

  useEffect(() => {
    fetchClipboard();
  }, [fetchClipboard]);


  // Add new card
  const handleAddCard = async () => {
    if (!newCardContent.trim()) {
      toast({
        title: 'Empty content',
        description: 'Please enter some content for the card',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAddingCard(true);
      const card = await api.createCard(clipboardId, {
        content: newCardContent,
        user_name: userName || undefined,
      });
      setClipboard(prev => prev ? {
        ...prev,
        cards: [...prev.cards, card],
      } : null);
      setNewCardContent('');
      toast({
        title: 'Card added',
        description: 'Your card has been added to the clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to add card',
        description: err instanceof Error ? err.message : 'Could not add card',
        variant: 'destructive',
      });
    } finally {
      setIsAddingCard(false);
    }
  };

  // Update card
  const handleUpdateCard = async (cardId: number, content: string) => {
    const updatedCard = await api.updateCard(cardId, { content });
    setClipboard(prev => prev ? {
      ...prev,
      cards: prev.cards.map(c => c.id === cardId ? updatedCard : c),
    } : null);
  };

  // Delete card
  const handleDeleteCard = async (cardId: number) => {
    await api.deleteCard(cardId);
    setClipboard(prev => prev ? {
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId),
    } : null);
    toast({
      title: 'Card deleted',
      description: 'The card has been removed',
    });
  };

  // Delete entire clipboard
  const handleDeleteClipboard = async () => {
    try {
      setIsDeletingClipboard(true);
      await api.deleteClipboard(clipboardId);
      toast({
        title: 'Clipboard deleted',
        description: 'The clipboard and all cards have been deleted',
      });
      window.location.href = '/';
    } catch (err) {
      toast({
        title: 'Failed to delete',
        description: err instanceof Error ? err.message : 'Could not delete clipboard',
        variant: 'destructive',
      });
      setIsDeletingClipboard(false);
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
            <span className="font-mono text-sm text-foreground">{clipboardId}</span>
          </div>
          {clipboard?.updated_at && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(clipboard.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClipboard(true)}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={copyLink}
            className="gap-1.5"
          >
            <Link className="w-4 h-4" />
            <span className="hidden sm:inline">
              {copiedLink ? 'Copied!' : 'Share Link'}
            </span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Clipboard?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this clipboard and all its cards. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClipboard}
                  disabled={isDeletingClipboard}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingClipboard ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Add New Card */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Add a new card <span className="text-muted-foreground font-normal">as {userName}</span></h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Enter content for the new card..."
            value={newCardContent}
            onChange={(e) => setNewCardContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddCard();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddCard}
            disabled={isAddingCard || !newCardContent.trim()}
            className="gap-1.5"
          >
            {isAddingCard ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Card
          </Button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {clipboard?.cards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No cards yet. Add your first card above!</p>
          </div>
        ) : (
          clipboard?.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onUpdate={handleUpdateCard}
              onDelete={handleDeleteCard}
            />
          ))
        )}
      </div>

      {/* Card count */}
      {clipboard && clipboard.cards.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {clipboard.cards.length} card{clipboard.cards.length !== 1 ? 's' : ''} in this clipboard
        </div>
      )}
    </div>
  );
}
