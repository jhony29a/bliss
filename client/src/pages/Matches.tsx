import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFadeInAnimation } from "@/lib/animations";
import { animated } from "react-spring";
import { Lock } from "lucide-react";

const Matches = () => {
  const [, navigate] = useLocation();
  const { user, upgradeToVip } = useUser();
  
  // Animations for staggered loading
  const fadeTitle = useFadeInAnimation(100);
  const fadeSubtitle = useFadeInAnimation(200);
  const fadeVip = useFadeInAnimation(300);
  const fadeGrid = useFadeInAnimation(400);
  
  // Fetch matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['/api/users/matches'],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-200 mb-2 rounded"></div>
          <div className="h-5 w-60 bg-gray-200 mb-6 rounded"></div>
          
          <div className="h-32 w-full rounded-xl bg-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 w-full rounded-xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <animated.div style={fadeTitle} className="mb-1">
        <h1 className="text-2xl font-bold">Matches</h1>
      </animated.div>
      <animated.div style={fadeSubtitle} className="mb-6">
        <p className="text-gray-500">Pessoas que também gostaram de você</p>
      </animated.div>
      
      {/* VIP Teaser - Only show if not VIP */}
      {!user?.isVip && (
        <animated.div style={fadeVip} className="mb-6">
          <Card className="p-4 border border-dashed border-primary">
            <div className="flex items-center mb-2">
              <Lock className="text-primary mr-2 h-4 w-4" />
              <h3 className="font-semibold">4 pessoas gostaram de você</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Torne-se VIP para ver quem já curtiu seu perfil antes de dar match!
            </p>
            <Button 
              className="w-full py-2 h-auto gradient-primary border-none hover:opacity-90"
              onClick={upgradeToVip}
            >
              Obter Acesso VIP
            </Button>
          </Card>
        </animated.div>
      )}
      
      {/* Matches Grid */}
      <animated.div style={fadeGrid} className="grid grid-cols-2 gap-4">
        {matches && matches.length > 0 ? (
          matches.map((match: any) => (
            <div 
              key={match.id} 
              className="match-card relative rounded-xl overflow-hidden cursor-pointer"
              onClick={() => navigate(`/chat/${match.user.id}`)}
            >
              <img 
                src={match.user.profilePicUrl} 
                alt={`Match: ${match.user.name}`} 
                className="w-full h-48 object-cover" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h4 className="font-medium">{match.user.name}, {match.user.age}</h4>
                <p className="text-xs">
                  Match em {new Date(match.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Sem matches ainda</h3>
            <p className="text-gray-500 mb-4">
              Continue curtindo perfis para aumentar suas chances de match!
            </p>
            <Button onClick={() => navigate('/')}>
              Explorar perfis
            </Button>
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default Matches;
