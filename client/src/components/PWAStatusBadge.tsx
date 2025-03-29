import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DownloadCloud, CheckCircle2 } from "lucide-react";

/**
 * Um componente que mostra um distintivo indicando se o aplicativo está
 * sendo executado como uma PWA ou no navegador.
 */
const PWAStatusBadge = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Verifica se o app está sendo executado como PWA instalada
    const checkIfPWA = () => {
      // Verifica se está em modo standalone ou fullscreen (PWA instalado)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Também verifica pelo manifest no iOS (propriedade específica do Safari)
      // @ts-ignore - A propriedade standalone existe no Safari mas não está no tipo Navigator
      const isIOSStandalone = window.navigator.standalone;
      
      const isInStandaloneMode = 
        isIOSStandalone || 
        isStandalone || 
        isFullscreen || 
        isMinimalUi;
      
      setIsPWA(isInStandaloneMode);
      
      // Esconde o distintivo após 10 segundos se o app estiver instalado
      if (isInStandaloneMode) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    };
    
    checkIfPWA();
    
    // Atualiza status quando houver mudança no modo de exibição
    const displayModeMediaQuery = window.matchMedia('(display-mode: standalone)');
    displayModeMediaQuery.addEventListener('change', checkIfPWA);
    
    return () => {
      displayModeMediaQuery.removeEventListener('change', checkIfPWA);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-right-5 duration-500">
      <Badge 
        variant={isPWA ? "default" : "outline"}
        className={`py-2 px-3 shadow-lg ${
          isPWA ? 'bg-green-600 hover:bg-green-700' : ''
        }`}
      >
        {isPWA ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            App instalado
          </>
        ) : (
          <>
            <DownloadCloud className="h-3.5 w-3.5 mr-1" />
            App disponível
          </>
        )}
      </Badge>
    </div>
  );
};

export default PWAStatusBadge;