import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Crown } from "lucide-react";
import VipSubscriptionModal from "./VipSubscriptionModal";

interface VipBannerProps {
  onUpgrade?: () => void;
}

const VipBanner = ({ onUpgrade }: VipBannerProps) => {
  const { user, upgradeToVip } = useUser();
  const [showVipModal, setShowVipModal] = useState(false);
  
  // Don't show if user is already VIP
  if (user?.isVip) return null;
  
  const handleUpgradeClick = () => {
    // Sempre abrir o modal de assinatura, independente do parâmetro onUpgrade
    setShowVipModal(true);
  };

  // Função que envia os dados do plano para o UserContext
  const handleSubscribe = async (planData: { planType: string, amount: number, paymentMethod: string }) => {
    await upgradeToVip(planData);
  };
  
  return (
    <>
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center">
            <Crown className="h-4 w-4 mr-1" />
            Acesso VIP
          </h3>
          <p className="text-sm opacity-90">Descubra quem já curtiu você!</p>
        </div>
        <Button 
          onClick={handleUpgradeClick} 
          className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-1.5 h-auto text-sm"
        >
          R$ 9,90/mês
        </Button>
      </div>
      
      {/* VIP Subscription Modal */}
      <VipSubscriptionModal 
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        onSubscribe={handleSubscribe}
        user={user}
      />
    </>
  );
};

export default VipBanner;
