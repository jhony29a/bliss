import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMatchSchema, insertMessageSchema, insertUserPreferencesSchema, insertSubscriptionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    user: { id: number; username: string; isVip: boolean; };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // A configuração de session, inicialização de passport e estratégias de autenticação
  // foram movidas para o arquivo auth.ts
  
  // Error handler for Zod validation errors
  const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  };
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Você precisa estar autenticado" });
  };
  
  // Routes
  
  // Nós estamos usando o auth.ts para lidar com rotas de autenticação agora
  
  // User routes
  app.get("/api/users/me", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userData = await storage.getUser(user.id);
    
    if (!userData) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    // Remove sensitive info
    const { password, ...userInfo } = userData;
    return res.json(userInfo);
  });
  
  app.put("/api/users/me", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userData = await storage.updateUser(user.id, req.body);
      
      if (!userData) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove sensitive info
      const { password, ...userInfo } = userData;
      return res.json(userInfo);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Potential match discovery
  app.get("/api/users/potential-matches", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const potentialMatches = await storage.getPotentialMatches(user.id);
      
      // Remove sensitive info from each user
      const safeMatches = potentialMatches.map(({ password, ...userInfo }) => userInfo);
      
      return res.json(safeMatches);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar matches potenciais" });
    }
  });
  
  // Swiping/matching
  app.post("/api/users/swipe", isAuthenticated, async (req, res) => {
    try {
      // Extrair os dados do corpo da requisição
      const swipeData = req.body;
      const user = req.user as any;
      
      // Validar os dados com o schema
      const validatedData = insertMatchSchema.parse({
        userId1: user.id,
        userId2: swipeData.userId2,
        matched: swipeData.liked // campo 'liked' do front-end mapeia para 'matched' internamente
      });
      
      // Criar o swipe
      const match = await storage.createSwipe(validatedData.userId1, validatedData.userId2, !!validatedData.matched);
      return res.json({ match });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Get matches
  app.get("/api/users/matches", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const matches = await storage.getMatches(user.id);
      
      // Remove sensitive info from each matched user
      const safeMatches = matches.map(match => {
        const { password, ...userInfo } = match.user;
        return {
          ...match,
          user: userInfo
        };
      });
      
      return res.json(safeMatches);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar matches" });
    }
  });
  
  // Messaging
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const user = req.user as any;
      
      // Ensure the sender is the authenticated user
      if (messageData.senderId !== user.id) {
        return res.status(403).json({ message: "Você só pode enviar mensagens como você mesmo" });
      }
      
      const message = await storage.createMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const user = req.user as any;
      
      const messages = await storage.getMessages(user.id, otherUserId);
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });
  
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const conversations = await storage.getConversations(user.id);
      
      // Remove sensitive info from each user
      const safeConversations = conversations.map(conv => {
        const { password, ...userInfo } = conv.user;
        return {
          ...conv,
          user: userInfo
        };
      });
      
      return res.json(safeConversations);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar conversas" });
    }
  });
  
  // User preferences
  app.get("/api/users/preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const preferences = await storage.getUserPreferences(user.id);
      
      // If no preferences yet, return default values
      if (!preferences) {
        return res.json({
          userId: user.id,
          minAge: 18,
          maxAge: 35,
          distance: 50,
          gender: null,
          interests: []
        });
      }
      
      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar preferências" });
    }
  });
  
  app.post("/api/users/preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const prefsData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const preferences = await storage.createOrUpdateUserPreferences(prefsData);
      return res.json(preferences);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Subscription routes
  // Get current subscription
  app.get("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const subscription = await storage.getUserSubscription(user.id);
      return res.json(subscription || null);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar assinatura" });
    }
  });

  // Create new subscription
  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      console.log("Dados recebidos para assinatura:", JSON.stringify(req.body));
      
      // Verificar se o usuário já possui uma assinatura ativa
      const existingSubscription = await storage.getUserSubscription(user.id);
      if (existingSubscription) {
        return res.status(400).json({ message: "Você já possui uma assinatura ativa" });
      }
      
      // Validar manualmente antes de chamar o parse para ter mensagens de erro mais claras
      if (!req.body.planType) {
        return res.status(400).json({ message: "O tipo de plano é obrigatório" });
      }
      
      if (req.body.amount === undefined || req.body.amount === null) {
        return res.status(400).json({ message: "O valor do plano é obrigatório" });
      }
      
      // In a real app, you would handle payment processing here
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        userId: user.id,
        status: 'active'
      });
      
      console.log("Dados validados para assinatura:", JSON.stringify(subscriptionData));
      
      // Criar a assinatura
      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update session
      req.session.user = {
        ...req.session.user!,
        isVip: true
      };
      
      return res.status(201).json(subscription);
    } catch (error) {
      return handleValidationError(error, res);
    }
  });

  // Cancel subscription
  app.post("/api/subscriptions/cancel", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const cancelled = await storage.cancelSubscription(user.id);
      
      if (!cancelled) {
        return res.status(404).json({ message: "Nenhuma assinatura ativa encontrada" });
      }
      
      // Update session
      req.session.user = {
        ...req.session.user!,
        isVip: false
      };
      
      return res.json({ success: true, message: "Assinatura cancelada com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao cancelar assinatura" });
    }
  });
  
  return httpServer;
}
