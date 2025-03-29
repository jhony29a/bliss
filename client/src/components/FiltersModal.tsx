import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { FiltersModalProps } from "@/lib/types";
import { animated } from "react-spring";
import { useFilterPanelAnimation } from "@/lib/animations";
import { useEffect, useState, useMemo } from "react";
import { X, Crown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const FiltersModal = ({ isOpen, onClose, preferences, onSave }: FiltersModalProps) => {
  const { user } = useUser();
  const isVip = useMemo(() => user?.isVip || false, [user]);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const panelStyle = useFilterPanelAnimation(isOpen);
  
  // Reset local state when preferences change
  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);
  
  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };
  
  const handleReset = () => {
    setLocalPrefs({
      minAge: 18,
      maxAge: 35,
      distance: 50,
      gender: null,
      interests: []
    });
  };
  
  const toggleInterest = (interest: string) => {
    if (!isVip) return; // Se não for VIP, não permite selecionar interesses
    
    if (localPrefs.interests.includes(interest)) {
      setLocalPrefs({
        ...localPrefs,
        interests: localPrefs.interests.filter(i => i !== interest)
      });
    } else {
      setLocalPrefs({
        ...localPrefs,
        interests: [...localPrefs.interests, interest]
      });
    }
  };
  
  const toggleGender = (gender: string | null) => {
    setLocalPrefs({
      ...localPrefs,
      gender
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-end md:items-center md:justify-center"
      onClick={onClose}
    >
      <animated.div 
        style={panelStyle}
        className="bg-white rounded-t-2xl md:rounded-xl w-full md:w-[500px] p-5 transform md:transform-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Filtros</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distância máxima
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                <Slider
                  value={[localPrefs.distance]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(values) => setLocalPrefs({ ...localPrefs, distance: values[0] })}
                />
              </div>
              <span className="text-sm font-medium w-16 text-right">{localPrefs.distance} km</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa etária
            </label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                min={18} 
                max={70} 
                value={localPrefs.minAge}
                onChange={(e) => setLocalPrefs({ ...localPrefs, minAge: parseInt(e.target.value) })}
                className="w-16 p-2 text-sm"
              />
              <span>até</span>
              <Input 
                type="number" 
                min={18} 
                max={70} 
                value={localPrefs.maxAge}
                onChange={(e) => setLocalPrefs({ ...localPrefs, maxAge: parseInt(e.target.value) })}
                className="w-16 p-2 text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gênero
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={localPrefs.gender === 'female' ? 'default' : 'outline'}
                onClick={() => toggleGender('female')}
                className="py-2 h-auto text-sm"
              >
                Mulheres
              </Button>
              <Button
                variant={localPrefs.gender === 'male' ? 'default' : 'outline'} 
                onClick={() => toggleGender('male')}
                className="py-2 h-auto text-sm"
              >
                Homens
              </Button>
              <Button 
                variant={localPrefs.gender === null ? 'default' : 'outline'}
                onClick={() => toggleGender(null)}
                className="py-2 h-auto text-sm"
              >
                Todos
              </Button>
            </div>
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Interesses
              {!isVip && (
                <span className="ml-2 flex items-center text-purple-500 text-xs font-semibold">
                  <Crown className="h-3 w-3 mr-1" />
                  Exclusivo VIP
                </span>
              )}
            </label>
            {!isVip && (
              <div className="mb-3 p-2 bg-purple-50 rounded-md text-sm text-purple-700">
                Assine o plano VIP para buscar perfis por interesses em comum!
              </div>
            )}
            <div className={`flex flex-wrap gap-2 ${!isVip ? 'opacity-60' : ''}`}>
              {['Viagens', 'Música', 'Esportes', 'Filmes', 'Arte', 'Culinária', 'Fotografia', 'Leitura'].map((interest) => {
                const isActive = localPrefs.interests.includes(interest);
                return (
                  <Button
                    key={interest}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => toggleInterest(interest)}
                    className="px-3 py-1 h-auto text-sm"
                    disabled={!isVip}
                  >
                    {interest}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 py-3 h-auto"
            onClick={handleReset}
          >
            Limpar
          </Button>
          <Button 
            className="flex-1 py-3 h-auto"
            onClick={handleSave}
          >
            Aplicar
          </Button>
        </div>
      </animated.div>
    </div>
  );
};

export default FiltersModal;
