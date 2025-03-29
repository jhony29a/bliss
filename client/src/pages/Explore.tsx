import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserProfile, UserPreferences } from "@/lib/types";
import { useUser } from "@/contexts/UserContext";
import ProfileCard from "@/components/ProfileCard";
import VipBanner from "@/components/VipBanner";
import MatchNotification from "@/components/MatchNotification";
import FiltersModal from "@/components/FiltersModal";
import { Button } from "@/components/ui/button";
import { X, Heart, Star, SlidersHorizontal } from "lucide-react";

const Explore = () => {
  const [, navigate] = useLocation();
  const { user, preferences, updatePreferences, upgradeToVip } = useUser();
  const [showFilters, setShowFilters] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  // Fetch potential matches
  const { data: potentialMatches, isLoading } = useQuery({
    queryKey: ['/api/users/potential-matches'],
    refetchOnWindowFocus: false,
  });
  
  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ targetUserId, liked }: { targetUserId: number, liked: boolean }) => {
      const res = await apiRequest('POST', '/api/users/swipe', { 
        userId1: user?.id,
        userId2: targetUserId,
        liked
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // If it's a match, show the match notification
      if (data.match.matched) {
        const matchedProfile = potentialMatches?.find((profile: UserProfile) => 
          profile.id === data.match.userId2
        );
        if (matchedProfile) {
          setMatchedUser(matchedProfile);
          setShowMatchModal(true);
        }
      }
      
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      
      // Refresh potential matches if running low
      if (potentialMatches && currentCardIndex >= potentialMatches.length - 3) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/potential-matches'] });
      }
    }
  });
  
  const handleSwipeLeft = (userId: number) => {
    if (user) {
      swipeMutation.mutate({ targetUserId: userId, liked: false });
    }
  };
  
  const handleSwipeRight = (userId: number) => {
    if (user) {
      swipeMutation.mutate({ targetUserId: userId, liked: true });
    }
  };
  
  const handleSuperLike = (userId: number) => {
    if (user) {
      // Super like is a special kind of like
      swipeMutation.mutate({ targetUserId: userId, liked: true });
      // In a real app you could have a different API endpoint for super likes
    }
  };
  
  const handleSendMessage = (userId: number) => {
    setShowMatchModal(false);
    navigate(`/chat/${userId}`);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 pb-20 flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-pulse">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 mx-auto"></div>
          <div className="h-6 w-48 bg-gray-200 mb-2 mx-auto rounded"></div>
          <div className="h-4 w-40 bg-gray-200 mx-auto rounded"></div>
        </div>
      </div>
    );
  }
  
  // No more profiles
  if (potentialMatches && potentialMatches.length === 0) {
    return (
      <div className="p-4 pb-20 flex flex-col items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sem mais perfis</h2>
          <p className="text-gray-500 mb-6">
            Não encontramos mais perfis para mostrar no momento. Volte mais tarde!
          </p>
          <Button onClick={() => setShowFilters(true)}>
            Ajustar filtros
          </Button>
        </div>
      </div>
    );
  }
  
  // Show current profile card
  const currentProfile = potentialMatches && currentCardIndex < potentialMatches.length 
    ? potentialMatches[currentCardIndex] 
    : null;
  
  // Next profiles for the stack
  const nextProfiles = potentialMatches && potentialMatches.length > currentCardIndex + 1
    ? potentialMatches.slice(currentCardIndex + 1, currentCardIndex + 3)
    : [];
  
  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Bliss</h1>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowFilters(true)}
          aria-label="Filtros"
        >
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      {/* VIP Banner */}
      <VipBanner onUpgrade={upgradeToVip} />
      
      {/* Profile Card Stack */}
      <div className="profile-card-container relative h-[500px] mx-auto max-w-sm">
        {currentProfile && (
          <ProfileCard
            key={currentProfile.id}
            id={currentProfile.id}
            name={currentProfile.name}
            age={currentProfile.age}
            location={currentProfile.location}
            interests={currentProfile.interests}
            profilePicUrl={currentProfile.profilePicUrl}
            index={0}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSuperLike={handleSuperLike}
          />
        )}
        
        {/* Background cards for visual stack effect */}
        {nextProfiles.map((profile, index) => (
          <ProfileCard
            key={profile.id}
            id={profile.id}
            name={profile.name}
            age={profile.age}
            location={profile.location}
            interests={profile.interests}
            profilePicUrl={profile.profilePicUrl}
            index={index + 1}
          />
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="p-4 h-14 w-14 rounded-full shadow-lg text-red-500"
          onClick={() => currentProfile && handleSwipeLeft(currentProfile.id)}
        >
          <X className="h-7 w-7" />
        </Button>
        
        <Button 
          size="icon" 
          className="p-4 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => currentProfile && handleSwipeRight(currentProfile.id)}
        >
          <Heart className="h-7 w-7" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="p-4 h-14 w-14 rounded-full shadow-lg text-[#6C22A6]"
          onClick={() => currentProfile && handleSuperLike(currentProfile.id)}
        >
          <Star className="h-7 w-7" />
        </Button>
      </div>
      
      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        preferences={preferences}
        onSave={updatePreferences}
      />
      
      {/* Match Notification */}
      <MatchNotification
        visible={showMatchModal}
        matchedUser={matchedUser}
        onClose={() => setShowMatchModal(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Explore;
