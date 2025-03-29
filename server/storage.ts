import { 
  users, type User, type InsertUser,
  matches, type Match, type InsertMatch,
  messages, type Message, type InsertMessage,
  userPreferences, type UserPreference, type InsertUserPreference,
  subscriptions, type Subscription, type InsertSubscription
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Match operations
  createSwipe(userId1: number, userId2: number, liked: boolean): Promise<Match>;
  getMatches(userId: number): Promise<(Match & { user: User })[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: number, userId2: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{ user: User, lastMessage: Message }[]>;
  
  // Preference operations
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createOrUpdateUserPreferences(prefs: InsertUserPreference): Promise<UserPreference>;
  
  // Subscription operations
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  cancelSubscription(userId: number): Promise<boolean>;
  
  // Discovery operations
  getPotentialMatches(userId: number): Promise<User[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private messages: Map<number, Message>;
  private userPreferences: Map<number, UserPreference>;
  private subscriptions: Map<number, Subscription>;
  
  userCurrentId: number;
  matchCurrentId: number;
  messageCurrentId: number;
  preferenceCurrentId: number;
  subscriptionCurrentId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.userPreferences = new Map();
    this.subscriptions = new Map();
    
    this.userCurrentId = 1;
    this.matchCurrentId = 1;
    this.messageCurrentId = 1;
    this.preferenceCurrentId = 1;
    this.subscriptionCurrentId = 1;
    
    // Create session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every day
    });
    
    // Add sample users for development
    // We need to call this asynchronously, but can't make constructor async
    setTimeout(() => { this.setupInitialData(); }, 0);
  }

  private async setupInitialData() {
    try {
      // Importar bcrypt
      const bcrypt = await import("bcryptjs");
      
      // Senha padrão para todos os usuários de teste (será criptografada)
      const defaultPassword = await bcrypt.hash("password123", 10);
      
      // Add some demo users
      const demoUsers: InsertUser[] = [
        {
          username: "miguel",
          password: defaultPassword,
          name: "Miguel",
          age: 30,
          bio: "Fotógrafo e amante da natureza. Adoro viajar, conhecer novos lugares e experimentar diferentes culinárias.",
          location: "São Paulo",
          gender: "male",
          lookingFor: "female",
          profilePicUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
          isVip: true,
          interests: ["Fotografia", "Viagens", "Gastronomia", "Cinema", "Música"],
          photos: [
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            "https://images.unsplash.com/photo-1513267048331-5611cad62e41",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9",
            "https://images.unsplash.com/photo-1495216875107-c6c043eb703f",
            "https://images.unsplash.com/photo-1505968409348-bd000797c92e"
          ]
        },
        {
          username: "sofia",
          password: defaultPassword,
          name: "Sofia",
          age: 28,
          bio: "Apaixonada por arte e cultura. Estou sempre em busca de novas experiências e conexões significativas.",
          location: "São Paulo",
          gender: "female",
          lookingFor: "male",
          profilePicUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          isVip: false,
          interests: ["Fotografia", "Viagens", "Yoga"],
          photos: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
          ]
        },
        {
          username: "lucas",
          password: defaultPassword,
          name: "Lucas",
          age: 32,
          bio: "Engenheiro e entusiasta de esportes. Amo assistir jogos de futebol e praticar corrida aos finais de semana.",
          location: "Rio de Janeiro",
          gender: "male",
          lookingFor: "female",
          profilePicUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
          isVip: false,
          interests: ["Esportes", "Tecnologia", "Viagens"],
          photos: [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
          ]
        },
        {
          username: "mariana",
          password: defaultPassword,
          name: "Mariana",
          age: 26,
          bio: "Designer gráfica e amante de livros. Buscando alguém que compartilhe do mesmo amor pela leitura.",
          location: "São Paulo",
          gender: "female",
          lookingFor: "male",
          profilePicUrl: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1",
          isVip: false,
          interests: ["Leitura", "Arte", "Design", "Música"],
          photos: [
            "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
          ]
        },
        {
          username: "julia",
          password: defaultPassword,
          name: "Julia",
          age: 25,
          bio: "Professora de yoga e meditação. Estou sempre em busca de paz interior e harmonia.",
          location: "São Paulo",
          gender: "female",
          lookingFor: "male",
          profilePicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
          isVip: false,
          interests: ["Yoga", "Meditação", "Leitura", "Viagens"],
          photos: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
          ]
        },
        {
          username: "pedro",
          password: defaultPassword,
          name: "Pedro",
          age: 30,
          bio: "Chef de cozinha e viajante. Adoro conhecer novos sabores e culturas através da gastronomia.",
          location: "São Paulo",
          gender: "male",
          lookingFor: "female",
          profilePicUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          isVip: false,
          interests: ["Gastronomia", "Viagens", "Culinária", "Vinhos"],
          photos: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
            "https://images.unsplash.com/photo-1504257432389-52343af06ae3"
          ]
        },
        {
          username: "amanda",
          password: defaultPassword,
          name: "Amanda",
          age: 27,
          bio: "Apaixonada por música e festivais. Sempre em busca da próxima aventura.",
          location: "Rio de Janeiro",
          gender: "female",
          lookingFor: "male",
          profilePicUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
          isVip: false,
          interests: ["Música", "Festivais", "Viagens", "Arte"],
          photos: [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
            "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1"
          ]
        },
        {
          username: "joao",
          password: await bcrypt.hash("testesemvip", 10),
          name: "João",
          age: 29,
          bio: "Arquiteto e entusiasta de fotografia. Busco alguém para compartilhar momentos e eternizá-los em fotos.",
          location: "São Paulo",
          gender: "male",
          lookingFor: "female",
          profilePicUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3",
          isVip: false,
          interests: ["Arquitetura", "Fotografia", "Design", "Viagens"],
          photos: [
            "https://images.unsplash.com/photo-1504257432389-52343af06ae3",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
          ]
        }
      ];

      // Create users (await each creation)
      const createdUsers = await Promise.all(
        demoUsers.map(user => this.createUser(user))
      );

      // Find specific users
      const miguel = await this.getUserByUsername("miguel");
      const julia = await this.getUserByUsername("julia");
      const pedro = await this.getUserByUsername("pedro");
      const amanda = await this.getUserByUsername("amanda");
      const sofia = await this.getUserByUsername("sofia");

      if (miguel && julia) {
        // Match with Julia
        await this.createSwipe(miguel.id, julia.id, true);
        await this.createSwipe(julia.id, miguel.id, true);
        
        await this.createMessage({
          senderId: julia.id,
          receiverId: miguel.id,
          content: "Oi! Tudo bem com você? 😊",
          read: true
        });
        
        await this.createMessage({
          senderId: miguel.id,
          receiverId: julia.id,
          content: "Oi Julia! Tudo ótimo, e você? Que legal termos dado match!",
          read: true
        });
        
        await this.createMessage({
          senderId: julia.id,
          receiverId: miguel.id,
          content: "Também estou bem! Sim, vi que você curte fotografia também. Qual seu estilo favorito?",
          read: true
        });
      }
      
      if (miguel && pedro) {
        // Match with Pedro
        await this.createSwipe(miguel.id, pedro.id, true);
        await this.createSwipe(pedro.id, miguel.id, true);
        
        await this.createMessage({
          senderId: pedro.id,
          receiverId: miguel.id,
          content: "Vamos combinar de ir naquele restaurante novo então? O que acha?",
          read: false
        });
      }
      
      if (miguel && amanda) {
        // Match with Amanda
        await this.createSwipe(miguel.id, amanda.id, true);
        await this.createSwipe(amanda.id, miguel.id, true);
        
        await this.createMessage({
          senderId: miguel.id,
          receiverId: amanda.id,
          content: "Com certeza! Vou te mandar o link",
          read: true
        });
      }
      
      if (miguel && sofia) {
        // Add swipe for Sofia (but not yet matched)
        await this.createSwipe(sofia.id, miguel.id, true);
      }
      
      // Adicionar assinatura VIP para Miguel
      if (miguel) {
        await this.createSubscription({
          userId: miguel.id,
          planType: 'monthly',
          amount: 990, // R$ 9,90 (em centavos)
          status: 'active',
          paymentMethod: 'credit_card'
        });
      }
    } catch (error) {
      console.error("Error setting up initial data:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    
    // Garantir que campos opcionais sejam null em vez de undefined
    const userData = {
      ...insertUser,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      profilePicUrl: insertUser.profilePicUrl || null,
      isVip: insertUser.isVip || false,
      interests: insertUser.interests || [],
      photos: insertUser.photos || [],
    };
    
    const user: User = { 
      ...userData, 
      id, 
      createdAt: new Date() 
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createSwipe(userId1: number, userId2: number, liked: boolean): Promise<Match> {
    // Check if swipe already exists
    const existingSwipes = Array.from(this.matches.values()).filter(
      m => (m.userId1 === userId1 && m.userId2 === userId2) ||
           (m.userId1 === userId2 && m.userId2 === userId1)
    );
    
    // If a match already exists, return it
    if (existingSwipes.length > 0) {
      const existingMatch = existingSwipes[0];
      // If this is a mutual like, update matched to true
      if (existingMatch.userId1 === userId2 && liked) {
        existingMatch.matched = true;
        this.matches.set(existingMatch.id, existingMatch);
      }
      return existingMatch;
    }
    
    // Check for reverse swipe to see if it's a match
    const reverseSwipe = Array.from(this.matches.values()).find(
      m => m.userId1 === userId2 && m.userId2 === userId1
    );
    
    const isMatched = liked && reverseSwipe ? true : false;
    
    const id = this.matchCurrentId++;
    const match: Match = {
      id,
      userId1,
      userId2,
      matched: isMatched,
      createdAt: new Date()
    };
    
    this.matches.set(id, match);
    return match;
  }

  async getMatches(userId: number): Promise<(Match & { user: User })[]> {
    const userMatches = Array.from(this.matches.values()).filter(
      m => (m.userId1 === userId || m.userId2 === userId) && m.matched
    );
    
    return userMatches.map(match => {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      const user = this.users.get(otherUserId);
      
      if (!user) {
        throw new Error(`User with ID ${otherUserId} not found`);
      }
      
      return {
        ...match,
        user
      };
    });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    
    // Garantir que campos opcionais sejam definidos corretamente
    const messageData = {
      ...message,
      read: message.read === undefined ? false : message.read
    };
    
    const newMessage: Message = { 
      ...messageData, 
      id, 
      createdAt: new Date() 
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        m => (m.senderId === userId1 && m.receiverId === userId2) || 
             (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return aTime - bTime;
      });
  }

  async getConversations(userId: number): Promise<{ user: User; lastMessage: Message }[]> {
    // Get all user IDs that the current user has messaged with
    const messages = Array.from(this.messages.values()).filter(
      m => m.senderId === userId || m.receiverId === userId
    );
    
    const userIdsMap = new Map<number, boolean>();
    
    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      userIdsMap.set(otherUserId, true);
    });
    
    const conversations: { user: User; lastMessage: Message }[] = [];
    
    // For each unique user ID, get the most recent message
    userIdsMap.forEach((_, otherUserId) => {
      const user = this.users.get(otherUserId);
      
      if (!user) return;
      
      const userMessages = messages.filter(
        m => (m.senderId === userId && m.receiverId === otherUserId) || 
             (m.senderId === otherUserId && m.receiverId === userId)
      );
      
      if (userMessages.length === 0) return;
      
      const lastMessage = userMessages.reduce((latest, current) => {
        const latestTime = latest.createdAt?.getTime() || 0;
        const currentTime = current.createdAt?.getTime() || 0;
        return latestTime > currentTime ? latest : current;
      });
      
      conversations.push({
        user,
        lastMessage
      });
    });
    
    // Sort by most recent message
    return conversations.sort((a, b) => {
      const aTime = a.lastMessage.createdAt?.getTime() || 0;
      const bTime = b.lastMessage.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(
      pref => pref.userId === userId
    );
  }

  async createOrUpdateUserPreferences(prefs: InsertUserPreference): Promise<UserPreference> {
    const existingPrefs = await this.getUserPreferences(prefs.userId);
    
    // Garantir que campos opcionais sejam definidos corretamente
    const prefsData = {
      ...prefs,
      gender: prefs.gender || null,
      interests: prefs.interests || [],
      minAge: prefs.minAge ?? 18,
      maxAge: prefs.maxAge ?? 35,
      distance: prefs.distance ?? 50
    };
    
    if (existingPrefs) {
      const updatedPrefs = { ...existingPrefs, ...prefsData };
      this.userPreferences.set(existingPrefs.id, updatedPrefs);
      return updatedPrefs;
    }
    
    const id = this.preferenceCurrentId++;
    const newPrefs: UserPreference = { ...prefsData, id };
    this.userPreferences.set(id, newPrefs);
    return newPrefs;
  }

  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.userId === userId && sub.status === 'active'
    );
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionCurrentId++;
    
    // Estabeleça uma data de término para a assinatura (1 mês ou 1 ano a partir de agora)
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    if (subscription.planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (subscription.planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Padrão: 1 mês
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Garantir que campos opcionais sejam definidos corretamente
    const subscriptionData = {
      ...subscription,
      status: subscription.status || 'active',
      startDate,
      endDate,
      autoRenew: subscription.autoRenew === undefined ? true : subscription.autoRenew,
      paymentMethod: subscription.paymentMethod || null
    };
    
    const newSubscription: Subscription = { 
      ...subscriptionData, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.subscriptions.set(id, newSubscription);
    
    // Atualizar o usuário para VIP
    const user = await this.getUser(subscription.userId);
    if (user) {
      await this.updateUser(user.id, { isVip: true });
    }
    
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptions.get(id);
    if (!existingSubscription) return undefined;
    
    const now = new Date();
    const updatedSubscription: Subscription = { 
      ...existingSubscription, 
      ...subscription,
      updatedAt: now 
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(userId: number): Promise<boolean> {
    const userSubscriptions = Array.from(this.subscriptions.values()).filter(
      sub => sub.userId === userId && sub.status === 'active'
    );
    
    if (userSubscriptions.length === 0) return false;
    
    for (const subscription of userSubscriptions) {
      await this.updateSubscription(subscription.id, { status: 'cancelled' });
    }
    
    // Atualizar o usuário para não VIP
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(user.id, { isVip: false });
    }
    
    return true;
  }

  async getPotentialMatches(userId: number): Promise<User[]> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    // Get user preferences
    const userPrefs = await this.getUserPreferences(userId);
    
    // Verificar se o usuário é VIP
    const isVip = currentUser.isVip;
    
    // Get all users that match the gender preference
    const potentialUsers = Array.from(this.users.values()).filter(user => {
      // Don't include the current user
      if (user.id === userId) return false;
      
      // Filter by gender preference if specified
      if (userPrefs?.gender && user.gender !== userPrefs.gender) return false;
      
      // Filter by current user's looking for preference
      if (currentUser.lookingFor !== "all" && user.gender !== currentUser.lookingFor) return false;
      
      // Filter by age if preferences are set
      if (userPrefs?.minAge && user.age < userPrefs.minAge) return false;
      if (userPrefs?.maxAge && user.age > userPrefs.maxAge) return false;
      
      // Filtro por interesses (apenas VIP tem acesso à pesquisa avançada por interesses)
      if (isVip && userPrefs?.interests && userPrefs.interests.length > 0) {
        // Verifica se o usuário tem pelo menos um interesse em comum
        const userInterests = user.interests || [];
        const prefsInterests = userPrefs.interests || [];
        
        const hasCommonInterest = userInterests.some(interest => 
          prefsInterests.includes(interest)
        );
        
        if (!hasCommonInterest) return false;
      }
      
      // Check if user has already been swiped
      const alreadySwiped = Array.from(this.matches.values()).some(
        m => (m.userId1 === userId && m.userId2 === user.id)
      );
      
      return !alreadySwiped;
    });
    
    return potentialUsers;
  }
}

export const storage = new MemStorage();
