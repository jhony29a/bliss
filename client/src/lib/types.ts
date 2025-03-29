export interface ProfileCardProps {
  id: number;
  name: string;
  age: number;
  location: string;
  distance?: number;
  interests: string[];
  profilePicUrl: string;
  index?: number;
  onSwipeLeft?: (id: number) => void;
  onSwipeRight?: (id: number) => void;
  onSuperLike?: (id: number) => void;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  user: {
    id: number;
    name: string;
    profilePicUrl: string;
    username: string;
  };
  lastMessage: ChatMessage;
}

export interface MatchNotificationProps {
  visible: boolean;
  matchedUser: {
    id: number;
    name: string;
    profilePicUrl: string;
  } | null;
  onClose: () => void;
  onSendMessage: (userId: number) => void;
}

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  age: number;
  bio: string | null;
  location: string;
  gender: string;
  lookingFor: string;
  profilePicUrl: string;
  isVip: boolean;
  interests: string[];
  photos: string[];
}

export interface UserPreferences {
  minAge: number;
  maxAge: number;
  distance: number;
  gender: string | null;
  interests: string[];
}

export interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}
