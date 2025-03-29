import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Overlay com logo do Bliss para as fotos
const BlissWatermark = () => (
  <div className="absolute bottom-2 right-2 opacity-70">
    <div className="flex items-center bg-white/70 rounded-full px-2 py-1">
      <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-purple-400 text-transparent bg-clip-text">Bliss</span>
    </div>
  </div>
);

interface PhotoManagerProps {
  photos: string[];
  onAddPhoto: (url: string) => void;
  onRemovePhoto: (index: number) => void;
  onSetProfilePic: (url: string) => void;
  profilePicUrl: string;
}

const PhotoManager = ({ 
  photos, 
  onAddPhoto, 
  onRemovePhoto, 
  onSetProfilePic,
  profilePicUrl
}: PhotoManagerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const { toast } = useToast();

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) {
      toast({
        title: "URL da imagem é obrigatória",
        description: "Por favor, insira uma URL válida",
        variant: "destructive",
      });
      return;
    }

    onAddPhoto(photoUrl);
    setPhotoUrl("");
    setShowDialog(false);
    
    toast({
      title: "Foto adicionada com sucesso",
      description: "Sua nova foto foi adicionada ao perfil",
    });
  };

  const handleSetAsProfilePic = (url: string) => {
    onSetProfilePic(url);
    
    toast({
      title: "Foto de perfil atualizada",
      description: "Sua foto de perfil foi atualizada com sucesso",
    });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div key={i} className="relative h-32 group">
            <img 
              src={photo} 
              alt={`Foto ${i+1}`} 
              className={`w-full h-full object-cover rounded-lg ${photo === profilePicUrl ? 'border-2 border-purple-500' : ''}`}
            />
            <BlissWatermark />
            
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {photo !== profilePicUrl && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleSetAsProfilePic(photo)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  Definir como principal
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemovePhoto(i)}
                className="text-xs px-2 py-1 h-auto"
              >
                <X className="h-3 w-3 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        ))}
        
        <div 
          className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="text-gray-400" />
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nova foto</DialogTitle>
            <DialogDescription>
              Insira a URL de uma imagem para adicionar ao seu perfil
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="https://exemplo.com/minha-foto.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            {photoUrl && (
              <div className="mt-4 relative">
                <img 
                  src={photoUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg"
                  onError={() => {
                    toast({
                      title: "Erro ao carregar imagem",
                      description: "Verifique se a URL está correta",
                      variant: "destructive",
                    });
                    setPhotoUrl("");
                  }}
                />
                <BlissWatermark />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddPhoto} disabled={!photoUrl.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoManager;