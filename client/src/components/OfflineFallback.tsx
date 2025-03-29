import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { setupNetworkStatusMonitor } from '../service-worker-registration';

const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Usamos a função de monitoramento de rede do módulo de service worker
    const cleanup = setupNetworkStatusMonitor(
      // Callback quando ficar online
      () => setIsOnline(true),
      // Callback quando ficar offline
      () => setIsOnline(false)
    );

    return cleanup;
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
        <WifiOff className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">Você está offline</h2>
        <p className="text-gray-600 mb-4">
          Parece que você está sem conexão com a internet. Algumas funcionalidades podem não estar disponíveis.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="w-full"
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
};

export default OfflineFallback;