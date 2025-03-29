import { useSpring, config } from 'react-spring';

export const useCardAnimation = (
  index: number,
  isActive: boolean,
  isSwiped: boolean,
  direction: string
) => {
  const baseTransform = `scale(${isActive ? 1 : 0.95 - index * 0.05}) translateY(${index * 10}px)`;
  const swipeTransform = direction === 'left'
    ? 'translateX(-150%) rotate(-20deg)'
    : 'translateX(150%) rotate(20deg)';
    
  return useSpring({
    transform: isSwiped ? swipeTransform : baseTransform,
    opacity: isSwiped ? 0 : 1,
    zIndex: isActive ? 10 : 10 - index,
    config: { tension: 300, friction: 30 }
  });
};

export const useMatchAnimation = (visible: boolean) => {
  return useSpring({
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.9)',
    config: config.gentle
  });
};

export const useFilterPanelAnimation = (isOpen: boolean) => {
  return useSpring({
    transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
    config: { tension: 300, friction: 30 }
  });
};

export const useFadeInAnimation = (delay: number = 0) => {
  return useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay,
    config: { tension: 280, friction: 24 }
  });
};

export const useCardDragAnimation = (
  isDown: boolean,
  deltaX: number,
  deltaY: number,
  progress: number
) => {
  return useSpring({
    transform: isDown
      ? `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${deltaX * 0.1}deg)`
      : 'translateX(0px) translateY(0px) rotate(0deg)',
    config: { tension: 500, friction: isDown ? 50 : 30 }
  });
};
