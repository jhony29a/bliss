import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Info } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

// Define the BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android' | 'ios' | 'desktop' | 'unknown';

const InstallBanner = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  
  useEffect(() => {
    // Detectar a plataforma do usuário
    const detectPlatform = (): Platform => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/android/i.test(userAgent)) {
        return 'android';
      } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        return 'ios';
      } else if (/windows|macintosh|linux/i.test(userAgent)) {
        return 'desktop';
      }
      
      return 'unknown';
    };
    
    setPlatform(detectPlatform());
    
    // Save the install prompt event for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Save the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Check if we should show the banner (not previously dismissed)
      const installBannerDismissed = localStorage.getItem('installBannerDismissed');
      const dismissedTime = localStorage.getItem('installBannerDismissedTime');
      
      // Verificar se o banner já foi dispensado há mais de 3 dias
      const shouldShowAgain = dismissedTime && 
        (Date.now() - parseInt(dismissedTime)) > 3 * 24 * 60 * 60 * 1000;
      
      if (!installBannerDismissed || shouldShowAgain) {
        setIsVisible(true);
      }
    };

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setIsVisible(false);
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Also listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      // O aplicativo foi instalado, esconder o banner e limpar o prompt
      setIsVisible(false);
      setInstallPrompt(null);
      // Limpar flags de instalação dispensada
      localStorage.removeItem('installBannerDismissed');
      localStorage.removeItem('installBannerDismissedTime');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      // Se não temos o prompt de instalação mas estamos no iOS, mostrar instruções
      if (platform === 'ios') {
        setShowInfoDialog(true);
        return;
      }
      return;
    }
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // User installed the app, hide the banner
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
    }
    
    // Clear the saved prompt
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember that the user dismissed the banner
    localStorage.setItem('installBannerDismissed', 'true');
    localStorage.setItem('installBannerDismissedTime', Date.now().toString());
  };

  if (!isVisible) return null;

  // Instruções de instalação baseadas na plataforma
  const renderInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <>
            <p className="mb-2">Para instalar o Bliss no seu iPhone ou iPad:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Toque no ícone de compartilhamento <span className="bg-gray-200 px-2 py-1 rounded text-gray-700 text-xs">Compartilhar</span> na barra inferior do Safari</li>
              <li>Role a tela e selecione <span className="bg-gray-200 px-2 py-1 rounded text-gray-700 text-xs">Adicionar à Tela de Início</span></li>
              <li>Toque em <span className="bg-gray-200 px-2 py-1 rounded text-gray-700 text-xs">Adicionar</span> no canto superior direito</li>
            </ol>
            <p className="text-sm text-muted-foreground">O Bliss será adicionado à sua Tela de Início como um aplicativo independente.</p>
          </>
        );
      case 'android':
        return (
          <>
            <p className="mb-2">Para instalar o Bliss no seu dispositivo Android:</p>
            <p className="mb-4">Clique no botão "Instalar" quando aparecer o prompt do navegador, ou:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Toque no menu de três pontos do Chrome</li>
              <li>Selecione <span className="bg-gray-200 px-2 py-1 rounded text-gray-700 text-xs">Instalar aplicativo</span></li>
              <li>Confirme a instalação</li>
            </ol>
          </>
        );
      case 'desktop':
        return (
          <>
            <p className="mb-2">Para instalar o Bliss no seu computador:</p>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Clique no ícone de instalação <span className="bg-gray-200 px-2 py-1 rounded text-gray-700 text-xs">⊕</span> na barra de endereço</li>
              <li>Clique em "Instalar"</li>
            </ol>
            <p className="text-sm text-muted-foreground">O aplicativo funcionará offline e terá um ícone no seu desktop.</p>
          </>
        );
      default:
        return (
          <p>Siga as instruções do seu navegador para instalar o Bliss como um aplicativo.</p>
        );
    }
  };

  return (
    <>
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como instalar o Bliss</DialogTitle>
            <DialogDescription>
              Instale nosso aplicativo para ter a melhor experiência, mesmo offline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderInstallInstructions()}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-50 border-t border-border animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Instale o Bliss</p>
              <p className="text-sm text-muted-foreground">Para uma melhor experiência</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfoDialog(true)}
              className="hidden sm:flex"
            >
              <Info className="h-4 w-4 mr-1" />
              Como instalar
            </Button>
            <Button 
              size="sm" 
              onClick={handleInstall} 
              className="shadow-sm"
            >
              Instalar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              aria-label="Dispensar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallBanner;