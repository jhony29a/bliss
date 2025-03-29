import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Crown, CreditCard, Check } from "lucide-react";
import { UserProfile } from "@/lib/types";
import QRCode from "react-qr-code";

interface VipSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planData: { planType: string, amount: number, paymentMethod: string }) => Promise<void>;
  user: UserProfile | null;
}

const VipSubscriptionModal = ({ isOpen, onClose, onSubscribe, user }: VipSubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const { toast } = useToast();

  // Processar o pagamento e assinatura
  const handleSubscribe = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      toast({
        title: "Cartão inválido",
        description: "Por favor, insira um número de cartão válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Dados do plano com base na seleção (amount em centavos conforme esperado pela API)
      const planData = {
        planType: selectedPlan,
        amount: selectedPlan === 'monthly' ? 990 : 7080, // 9.90 * 100 = 990 centavos, 70.80 * 100 = 7080 centavos
        paymentMethod: 'credit_card'
      };

      console.log("Enviando dados para assinatura:", JSON.stringify(planData));

      // Simulação de processamento para melhor UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Chamar a função que cria a assinatura VIP do usuário
      await onSubscribe(planData);
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível completar a transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.isVip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-500" />
            Assine o Bliss VIP
          </DialogTitle>
          <DialogDescription>
            Desfrute de recursos exclusivos para encontrar sua conexão perfeita
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Escolha seu plano</h3>
            
            <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'yearly')}>
              <div className="flex items-start space-x-2 border rounded-lg p-3 hover:border-purple-400 cursor-pointer">
                <RadioGroupItem value="monthly" id="monthly" />
                <div className="flex-1">
                  <Label htmlFor="monthly" className="font-medium">Plano Mensal</Label>
                  <p className="text-sm text-gray-500">R$ 9,90 por mês</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">R$ 9,90</span>
                </div>
              </div>
              
              <div className="relative flex items-start space-x-2 border rounded-lg p-3 hover:border-purple-400 cursor-pointer">
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  40% OFF
                </div>
                <RadioGroupItem value="yearly" id="yearly" />
                <div className="flex-1">
                  <Label htmlFor="yearly" className="font-medium">Plano Anual</Label>
                  <p className="text-sm text-gray-500">R$ 5,90 por mês, cobrados anualmente</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">R$ 70,80</span>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Benefícios VIP</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <div className="bg-purple-100 rounded-full p-1 mr-2">
                  <Check className="h-3 w-3 text-purple-600" />
                </div>
                Veja quem já curtiu seu perfil antes de dar match
              </li>
              <li className="flex items-center text-sm">
                <div className="bg-purple-100 rounded-full p-1 mr-2">
                  <Check className="h-3 w-3 text-purple-600" />
                </div>
                Destaque seu perfil para mais pessoas verem
              </li>
              <li className="flex items-center text-sm">
                <div className="bg-purple-100 rounded-full p-1 mr-2">
                  <Check className="h-3 w-3 text-purple-600" />
                </div>
                Envie mensagens diretas sem precisar de match
              </li>
              <li className="flex items-center text-sm">
                <div className="bg-purple-100 rounded-full p-1 mr-2">
                  <Check className="h-3 w-3 text-purple-600" />
                </div>
                Até 5x mais matches que usuários não-VIP
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Informações de pagamento</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="space-y-3 flex-1">
                <div>
                  <Label htmlFor="card-number">Número do cartão</Label>
                  <Input 
                    id="card-number" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber}
                    onChange={(e) => {
                      // Limitar a 16 dígitos e apenas números
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(value);
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input id="expiry" placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500 mb-2">Ou pague com PIX</span>
                <div className="bg-white p-2 rounded-lg shadow">
                  <QRCode 
                    value={`bliss:payment:${selectedPlan}:${selectedPlan === 'monthly' ? '9.90' : '70.80'}`} 
                    size={120} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubscribe} 
            disabled={isSubmitting || !cardNumber || cardNumber.length < 16}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <span className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                {selectedPlan === 'monthly' ? 'Assinar por R$ 9,90/mês' : 'Assinar por R$ 70,80/ano'}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipSubscriptionModal;