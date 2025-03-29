import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFadeInAnimation } from "@/lib/animations";
import { animated } from "react-spring";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Conversation } from "@/lib/types";

const Messages = () => {
  const [, navigate] = useLocation();
  const { user } = useUser();
  
  // Animations
  const fadeHeader = useFadeInAnimation(100);
  const fadeList = useFadeInAnimation(200);
  
  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    refetchOnWindowFocus: false,
  });
  
  const formatMessageTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };
  
  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="p-4 border-b animate-pulse">
          <div className="h-8 w-40 bg-gray-200 mb-2 rounded"></div>
          <div className="h-5 w-60 bg-gray-200 rounded"></div>
        </div>
        
        <div className="divide-y">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 flex animate-pulse">
              <div className="w-14 h-14 rounded-full bg-gray-200 mr-3"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      {/* Header */}
      <animated.div style={fadeHeader} className="p-4 border-b">
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="text-gray-500">Suas conversas</p>
      </animated.div>
      
      {/* Conversation List */}
      <animated.div style={fadeList} className="divide-y">
        {conversations && conversations.length > 0 ? (
          conversations.map((conversation: Conversation) => (
            <div 
              key={conversation.user.id} 
              className="conversation-item p-4 flex items-center space-x-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/chat/${conversation.user.id}`)}
            >
              <div className="relative">
                <img 
                  src={conversation.user.profilePicUrl} 
                  alt={conversation.user.name} 
                  className="w-14 h-14 rounded-full object-cover" 
                />
                {/* Online status dot - could be dynamic in a real app */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium truncate">{conversation.user.name}</h4>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.lastMessage.createdAt.toString())}
                  </span>
                </div>
                <p className={`text-sm truncate ${
                  !conversation.lastMessage.read && 
                  conversation.lastMessage.senderId !== user?.id 
                    ? "font-medium" 
                    : "text-gray-600"
                }`}>
                  {conversation.lastMessage.senderId === user?.id && "Você: "}
                  {conversation.lastMessage.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Sem conversas</h3>
            <p className="text-gray-500">
              Quando você tiver matches, poderá iniciar conversas aqui.
            </p>
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default Messages;
