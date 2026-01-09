import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusinessesHomeContext } from '../BusinessesHomeContext';

export function BusinessesHomeEmptyState() {
  const { businesses, handleCreateBusiness } = useBusinessesHomeContext();

  if (businesses.length > 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
      <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Aún no hay negocios</h2>
      <p className="text-muted-foreground mb-6">
        Crea tu primer negocio para comenzar a gestionar tus operaciones
      </p>
      <Button onClick={handleCreateBusiness} className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Crear Negocio
      </Button>
    </div>
  );
}

