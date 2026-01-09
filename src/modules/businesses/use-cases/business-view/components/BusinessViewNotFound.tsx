import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BusinessViewNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Negocio no encontrado</h2>
        <Button onClick={() => navigate('/user/businesses')} variant="outline">
          Volver a negocios
        </Button>
      </div>
    </div>
  );
}

