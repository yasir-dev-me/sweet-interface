import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ClipboardEditor } from '@/components/ClipboardEditor';

const ClipboardPage = () => {
  const { clipboardId } = useParams<{ clipboardId: string }>();

  if (!clipboardId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClipboardEditor clipboardId={clipboardId} />
      </main>

      <Footer />
    </div>
  );
};

export default ClipboardPage;
