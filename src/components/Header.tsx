import { ClipboardList, Plus, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewClipboard = async () => {
    try {
      setIsCreating(true);
      const { id } = await api.createClipboard();
      navigate(`/${id}`);
    } catch {
      console.error('Failed to create clipboard');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground leading-tight">
                Shared<span className="text-primary">Clipboard</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Share text instantly
              </span>
            </div>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            
            <Button
              onClick={handleNewClipboard}
              disabled={isCreating}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Clipboard</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
