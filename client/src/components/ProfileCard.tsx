import { useState } from "react";
import { animated } from "react-spring";
import useSwiping from "@/hooks/useSwiping";
import { useCardDragAnimation } from "@/lib/animations";
import { ProfileCardProps } from "@/lib/types";
import { MapPin } from "lucide-react";

// Componente de marca d'água (watermark) com o logo do Bliss
const BlissWatermark = () => (
  <div className="absolute top-4 right-4 opacity-70">
    <div className="flex items-center bg-white/70 rounded-full px-2 py-1">
      <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-purple-400 text-transparent bg-clip-text">Bliss</span>
    </div>
  </div>
);

const ProfileCard = ({
  id,
  name,
  age,
  location,
  distance,
  interests,
  profilePicUrl,
  index = 0,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike
}: ProfileCardProps) => {
  const [isSwiped, setIsSwiped] = useState(false);
  
  const handleSwipeLeft = () => {
    setIsSwiped(true);
    if (onSwipeLeft) {
      onSwipeLeft(id);
    }
  };
  
  const handleSwipeRight = () => {
    setIsSwiped(true);
    if (onSwipeRight) {
      onSwipeRight(id);
    }
  };
  
  const {
    isDown,
    deltaX,
    deltaY,
    progress,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    direction
  } = useSwiping(150, handleSwipeLeft, handleSwipeRight);

  const cardStyle = useCardDragAnimation(isDown, deltaX, deltaY, progress);
  
  // Calculate scale based on card position in stack
  const scale = 1 - (index * 0.05);
  const yOffset = index * 10;
  
  const baseStyle = {
    transform: `scale(${scale}) translateY(${yOffset}px)`,
    zIndex: 10 - index
  };
  
  return (
    <animated.div
      className={`profile-card absolute w-full h-full bg-white rounded-xl overflow-hidden shadow-lg ${
        isSwiped ? (direction === 'left' ? 'swiped-left' : 'swiped-right') : ''
      }`}
      style={index === 0 ? { ...cardStyle } : baseStyle}
      onMouseDown={index === 0 ? handleMouseDown : undefined}
      onMouseMove={index === 0 ? handleMouseMove : undefined}
      onMouseUp={index === 0 ? handleMouseUp : undefined}
      onMouseLeave={index === 0 ? handleMouseLeave : undefined}
      onTouchStart={index === 0 ? handleMouseDown : undefined}
      onTouchMove={index === 0 ? handleMouseMove : undefined}
      onTouchEnd={index === 0 ? handleMouseUp : undefined}
    >
      <div className="relative h-4/5">
        <img
          src={profilePicUrl}
          alt={`Perfil de ${name}`}
          className="w-full h-full object-cover"
        />
        
        {/* Marca d'água do Bliss */}
        <BlissWatermark />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h2 className="text-2xl font-semibold">{name}, {age}</h2>
          <p className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{location}{distance ? `, ${distance}km` : ''}</span>
          </p>
        </div>
        
        {/* Swipe direction indicator */}
        {isDown && progress > 0.3 && (
          <div className={`absolute top-5 ${direction === 'left' ? 'right-5' : 'left-5'} p-3 rounded-full ${
            direction === 'left' ? 'bg-red-500' : 'bg-purple-500'
          }`}>
            {direction === 'left' ? (
              <span className="text-white text-xl">✕</span>
            ) : (
              <span className="text-white text-xl">♥</span>
            )}
          </div>
        )}
      </div>
      
      <div className="h-1/5 p-3 flex flex-col justify-between">
        <div className="flex flex-wrap gap-2">
          {interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </animated.div>
  );
};

export default ProfileCard;
