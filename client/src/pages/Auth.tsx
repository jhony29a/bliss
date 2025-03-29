import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";

const Auth = () => {
  const [, navigate] = useLocation();
  const { login, register, isLoggedIn } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    name: "",
    age: 18,
    gender: "male",
    lookingFor: "female",
    location: "",
    bio: "",
    interests: ["Música", "Viagens", "Filmes"]
  });

  // If user is already logged in, redirect to home
  // Este hook vem depois de todas as definições de hook para não violar as regras dos hooks
  if (isLoggedIn) {
    navigate("/");
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginData.username, loginData.password);
      navigate("/");
    } catch (error) {
      // Toast is already handled in UserContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!registerData.username || !registerData.password || !registerData.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validate age
    if (registerData.age < 18) {
      toast({
        title: "Idade inválida",
        description: "Você precisa ter pelo menos 18 anos para usar o Bliss.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await register(registerData);
      // Clear form data
      setRegisterData({
        username: "",
        password: "",
        name: "",
        age: 18,
        gender: "male",
        lookingFor: "female",
        location: "",
        bio: "",
        interests: ["Música", "Viagens", "Filmes"]
      });
      // Switch to login tab
      document.getElementById("login-tab")?.click();
      
      toast({
        title: "Conta criada com sucesso",
        description: "Agora você pode fazer login com suas credenciais.",
      });
    } catch (error) {
      // Toast is already handled in UserContext
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (registerData.interests.includes(interest)) {
      setRegisterData({
        ...registerData,
        interests: registerData.interests.filter((i) => i !== interest)
      });
    } else {
      setRegisterData({
        ...registerData,
        interests: [...registerData.interests, interest]
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-white">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center mb-2">
            <img src="/images/bliss-logo.svg" alt="Bliss Logo" className="h-20 mb-2" />
            <h1 className="text-3xl font-bold text-primary">Bliss</h1>
          </div>
          <p className="text-gray-600">Encontre novas conexões e relacionamentos</p>
        </div>

        {/* Auth Tabs */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Nome de usuário</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Digite seu nome de usuário"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full py-6 h-auto" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Informações de acesso</h3>
                  
                  <div>
                    <Label htmlFor="register-username">Nome de usuário</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Escolha um nome de usuário"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Escolha uma senha segura"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Informações pessoais</h3>
                  
                  <div>
                    <Label htmlFor="register-name">Nome completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="register-age">Idade</Label>
                      <Input
                        id="register-age"
                        type="number"
                        min={18}
                        value={registerData.age}
                        onChange={(e) => setRegisterData({ ...registerData, age: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-location">Localização</Label>
                      <Input
                        id="register-location"
                        type="text"
                        placeholder="Sua cidade"
                        value={registerData.location}
                        onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="register-gender">Gênero</Label>
                      <Select 
                        value={registerData.gender}
                        onValueChange={(value) => setRegisterData({ ...registerData, gender: value })}
                      >
                        <SelectTrigger id="register-gender">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="register-looking-for">Buscando por</Label>
                      <Select 
                        value={registerData.lookingFor}
                        onValueChange={(value) => setRegisterData({ ...registerData, lookingFor: value })}
                      >
                        <SelectTrigger id="register-looking-for">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Homens</SelectItem>
                          <SelectItem value="female">Mulheres</SelectItem>
                          <SelectItem value="both">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-bio">Sobre você</Label>
                    <Textarea
                      id="register-bio"
                      placeholder="Conte um pouco sobre você..."
                      value={registerData.bio}
                      onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                      className="resize-none h-24"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Seus interesses</h3>
                  <p className="text-xs text-gray-500">Selecione pelo menos um interesse</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Música', 'Viagens', 'Filmes', 'Esportes', 'Arte', 'Culinária', 'Fotografia', 'Leitura', 'Tecnologia', 'Natureza'].map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={registerData.interests.includes(interest) ? 'default' : 'outline'}
                        onClick={() => toggleInterest(interest)}
                        className="px-3 py-1 h-auto text-sm"
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full py-6 h-auto" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;