import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import { ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, MoreVertical, Image, Send } from "lucide-react";

const Chat = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch other user profile
  const { data: otherUser, isLoading: loadingUser } = useQuery({
    queryKey: [`/api/users/${id}`],
    queryFn: async () => {
      // Get user from matches as a workaround since we don't have a direct user endpoint
      const res = await fetch('/api/users/matches', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load user');
      const matches = await res.json();
      return matches.find((match: any) => match.user.id === parseInt(id)).user;
    }
  });
  
  // Fetch messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: [`/api/messages/${id}`],
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', '/api/messages', {
        senderId: user?.id,
        receiverId: parseInt(id),
        content,
        read: false
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (messageText.trim() && user) {
      sendMessageMutation.mutate(messageText);
      setMessageText("");
    }
  };
  
  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if message is from yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };
  
  const isLoading = loadingUser || loadingMessages;
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="p-4 bg-white shadow-sm flex items-center space-x-3 border-b animate-pulse">
          <div className="p-1">
            <ArrowLeft className="text-gray-400" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex-grow p-4 space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className={`h-10 w-48 rounded-lg ${i % 2 === 0 ? 'bg-primary/20' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-white border-t animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-gray-200"></div>
            <div className="flex-grow h-10 bg-gray-200 rounded-full"></div>
            <div className="p-2 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!otherUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Usuário não encontrado</h2>
        <Button onClick={() => navigate('/messages')}>
          Voltar para Mensagens
        </Button>
      </div>
    );
  }
  
  // Group messages by date
  const messageGroups: { [key: string]: ChatMessage[] } = {};
  messages?.forEach((message: ChatMessage) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!messageGroups[date]) {
      messageGroups[date] = [];
    }
    messageGroups[date].push(message);
  });
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-white shadow-sm flex items-center space-x-3 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/messages')}
          className="p-1"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        
        <img 
          src={otherUser.profilePicUrl} 
          alt={otherUser.name} 
          className="w-10 h-10 rounded-full object-cover" 
        />
        
        <div>
          <h2 className="font-medium">{otherUser.name}</h2>
          <p className="text-xs text-success">Online</p>
        </div>
        
        <Button variant="ghost" size="icon" className="ml-auto p-1">
          <MoreVertical className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {Object.keys(messageGroups).map(date => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center my-2">
              <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            
            {/* Messages for this date */}
            {messageGroups[date].map((message: ChatMessage) => (
              <div key={message.id} className={`flex items-end space-x-2 ${
                message.senderId === user?.id ? 'justify-end' : ''
              }`}>
                {message.senderId !== user?.id && (
                  <img 
                    src={otherUser.profilePicUrl} 
                    alt={otherUser.name} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                )}
                
                <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-last' : ''}`}>
                  <div className={`p-3 rounded-lg shadow-sm ${
                    message.senderId === user?.id 
                      ? 'bg-primary text-white chat-bubble-sent' 
                      : 'bg-white chat-bubble-received'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500 mx-2">
                      {formatMessageTime(message.createdAt.toString())}
                    </span>
                    {message.senderId === user?.id && (
                      <span className="text-xs text-primary">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* Show typing indicator as a demo */}
        <div className="flex items-end space-x-2">
          <img 
            src={otherUser.profilePicUrl} 
            alt={otherUser.name} 
            className="w-8 h-8 rounded-full object-cover" 
          />
          
          <div className="bg-white p-3 rounded-lg chat-bubble-received shadow-sm">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        
        {/* Ref for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-3 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500 p-2">
            <Image className="h-5 w-5" />
          </Button>
          
          <Input
            type="text"
            placeholder="Digite uma mensagem..."
            className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary bg-gray-50"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <Button 
            size="icon"
            disabled={!messageText.trim()}
            onClick={handleSendMessage}
            className="p-2 bg-primary text-white rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
