import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ClipboardList, Zap, Globe, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClipboard = async () => {
    try {
      setIsCreating(true);
      const { id } = await api.createClipboard();
      navigate(`/${id}`);
    } catch (error) {
      console.error('Failed to create clipboard:', error);
      setIsCreating(false);
    }
  };

  // Auto-redirect to new clipboard (optional - comment out if you want landing page)
  // useEffect(() => {
  //   handleCreateClipboard();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          {/* Hero Icon */}
          <div className="flex justify-center mb-8 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 pointer-events-none" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Share text <span className="gradient-text">instantly</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Create a clipboard, paste your content, and share the link.
            No signup, no hassle — just quick and easy text sharing.
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleCreateClipboard}
            disabled={isCreating}
            size="lg"
            className="gap-2 text-base px-8 h-12"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating clipboard...
              </>
            ) : (
              <>
                Create Clipboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Instant</h3>
              <p className="text-sm text-muted-foreground text-center">
                Create and share in seconds. Changes sync automatically.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Universal</h3>
              <p className="text-sm text-muted-foreground text-center">
                Works on any device. Share between phone and computer.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Private</h3>
              <p className="text-sm text-muted-foreground text-center">
                Only people with the link can access your clipboard.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
