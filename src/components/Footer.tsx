import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            Shared Clipboard — Share text instantly, no signup required.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Made with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> for quick sharing
          </p>
        </div>
      </div>
    </footer>
  );
}
