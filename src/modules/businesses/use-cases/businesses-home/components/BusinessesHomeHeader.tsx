import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusinessesHomeContext } from '../BusinessesHomeContext';

export function BusinessesHomeHeader() {
  const { handleCreateBusiness } = useBusinessesHomeContext();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Negocios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y organiza tus negocios
          </p>
        </div>
        <Button onClick={handleCreateBusiness} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Negocio
        </Button>
      </div>
    </div>
  );
}

