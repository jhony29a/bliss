import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserProfile, UserPreferences } from "@/lib/types";

// Interface para representar uma assinatura
interface Subscription {
  id: number;
  userId: number;
  planType: string;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean | null;
  status: string;
  paymentMethod: string | null;
  amount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface UserContextType {
  user: UserProfile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<void>;
  preferences: UserPreferences;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  upgradeToVip: (planData: { planType: string, amount: number, paymentMethod: string }) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  minAge: 18,
  maxAge: 35,
  distance: 50,
  gender: null,
  interests: []
};

const UserContext = createContext<UserContextType>({
  user: null,
  subscription: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateProfile: async () => {},
  preferences: defaultPreferences,
  updatePreferences: async () => {},
  upgradeToVip: async () => {},
  cancelSubscription: async () => {}
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  // Check session status
  const { data: sessionData = { authenticated: false }, isLoading: sessionLoading } = useQuery<{authenticated: boolean, user?: any}>({
    queryKey: ['/api/auth/session'],
    refetchOnWindowFocus: true
  });

  // Fetch user data if authenticated
  const { data: userData, isLoading: userLoading } = useQuery<UserProfile>({
    queryKey: ['/api/users/me'],
    enabled: sessionData.authenticated === true,
  });

  // Fetch user preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/users/preferences'],
    enabled: sessionData.authenticated === true,
  });

  // Fetch user subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery<Subscription | null>({
    queryKey: ['/api/subscriptions'],
    enabled: sessionData.authenticated === true,
  });

  // Update user when data is loaded
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Update subscription when data is loaded
  useEffect(() => {
    if (subscriptionData) {
      setSubscription(subscriptionData);
    }
  }, [subscriptionData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) de volta ao Bliss!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return await res.json();
    },
    onSuccess: () => {
      setUser(null);
      setSubscription(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Logout realizado com sucesso",
        description: "Esperamos vê-lo novamente em breve!",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso",
        description: "Faça login para começar a usar o Bliss!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Verifique os dados informados",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      const res = await apiRequest('PUT', '/api/users/me', userData);
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(prev => prev ? { ...prev, ...data } : data);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar suas alterações",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const res = await apiRequest('POST', '/api/users/preferences', preferences);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/preferences'] });
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências foram salvas com sucesso!",
      });
    }
  });

  // Create VIP subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planData: { planType: string, amount: number, paymentMethod: string }) => {
      const res = await apiRequest('POST', '/api/subscriptions', planData);
      return await res.json();
    },
    onSuccess: (data) => {
      setSubscription(data);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Parabéns! Você agora é VIP!",
        description: "Aproveite todos os benefícios exclusivos da assinatura VIP.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar assinatura",
        description: error.message || "Não foi possível completar a transação.",
        variant: "destructive",
      });
    }
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscriptions/cancel', {});
      return await res.json();
    },
    onSuccess: () => {
      setSubscription(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura VIP foi cancelada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Não foi possível processar o cancelamento.",
        variant: "destructive",
      });
    }
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(userData);
  };

  const updatePreferences = async (preferences: UserPreferences) => {
    await updatePreferencesMutation.mutateAsync(preferences);
  };

  const upgradeToVip = async (planData: { planType: string, amount: number, paymentMethod: string }) => {
    // O amount já deve estar em centavos conforme modificamos no VipSubscriptionModal
    console.log("UserContext - Enviando para API:", JSON.stringify(planData));
    try {
      await createSubscriptionMutation.mutateAsync(planData);
    } catch (error) {
      console.error("Erro ao fazer upgrade para VIP:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    await cancelSubscriptionMutation.mutateAsync();
  };

  // Verifica se está autenticado
  const isLoading = sessionLoading || (
    sessionData.authenticated === true && 
    (userLoading || preferencesLoading || subscriptionLoading)
  );
  const isLoggedIn = sessionData.authenticated === true;

  // Usa preferências padrão se não houver dados
  const preferences = preferencesData || defaultPreferences;

  return (
    <UserContext.Provider value={{
      user,
      subscription,
      isLoading,
      isLoggedIn,
      login,
      logout,
      register,
      updateProfile,
      preferences,
      updatePreferences,
      upgradeToVip,
      cancelSubscription
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
