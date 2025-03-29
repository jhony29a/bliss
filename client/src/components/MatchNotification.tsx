import { Button } from "@/components/ui/button";
import { MatchNotificationProps } from "@/lib/types";
import { useMatchAnimation } from "@/lib/animations";
import { animated } from "react-spring";
import { Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Componente de marca d'água (watermark) com o logo do Bliss
const BlissLogo = () => (
  <div className="mx-auto mb-2">
    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 text-transparent bg-clip-text">Bliss</span>
  </div>
);

const MatchNotification = ({ 
  visible, 
  matchedUser, 
  onClose, 
  onSendMessage 
}: MatchNotificationProps) => {
  const { user } = useUser();
  const springProps = useMatchAnimation(visible);
  
  if (!visible || !matchedUser || !user) return null;
  
  return (
    <animated.div 
      style={springProps} 
      className="fixed inset-0 bg-black bg-opacity-80 z-30 flex items-center justify-center"
    >
      <div className="text-center p-6 max-w-md">
        <BlissLogo />
        
        <div className="relative mb-8">
          <div className="absolute -left-10 bottom-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white z-10">
            <img 
              src={user.profilePicUrl} 
              alt={`Seu perfil`} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute -right-10 bottom-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white z-10">
            <img 
              src={matchedUser.profilePicUrl} 
              alt={matchedUser.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="w-32 h-32 mx-auto relative">
            <Heart className="text-purple-500 h-16 w-16 animate-pulse mx-auto" />
          </div>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">É um Match!</h2>
        <p className="text-gray-300 mb-8">
          Você e {matchedUser.name} gostaram um do outro
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => onSendMessage(matchedUser.id)} 
            className="w-full py-3 h-auto bg-gradient-to-r from-purple-600 to-purple-400 border-none text-white hover:opacity-90"
          >
            Enviar mensagem
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full py-3 h-auto bg-transparent border border-white text-white hover:bg-white/10"
          >
            Continuar explorando
          </Button>
        </div>
      </div>
    </animated.div>
  );
};

export default MatchNotification;
