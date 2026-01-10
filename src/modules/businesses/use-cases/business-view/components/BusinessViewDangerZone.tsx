import { AlertTriangle, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessViewContext } from '../BusinessViewContext';

export function BusinessViewDangerZone() {
  const { business, togglingBusinessStatus, handleOpenToggleBusinessStatusDialog } = useBusinessViewContext();

  if (!business) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <CardTitle>Zona de Peligro</CardTitle>
        </div>
        <CardDescription>
          Acciones críticas que pueden afectar la visibilidad y el acceso a los datos de tu negocio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-background">
          <div className="space-y-1">
            <h4 className="font-medium">
              {business.is_active ? 'Desactivar Negocio' : 'Activar Negocio'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {business.is_active 
                ? 'Deshabilita temporalmente este negocio. No será visible para los empleados.' 
                : 'Vuelve a habilitar este negocio para que sea visible y esté activo nuevamente.'}
            </p>
          </div>
          
          <Button 
            variant={business.is_active ? "destructive" : "default"}
            disabled={togglingBusinessStatus}
            className="gap-2"
            onClick={handleOpenToggleBusinessStatusDialog}
          >
            <Power className="w-4 h-4" />
            {business.is_active ? 'Desactivar' : 'Activar'}
          </Button>
        </div>

        {/* Placeholder for more dangerous actions if needed */}
      </CardContent>
    </Card>
  );
}
