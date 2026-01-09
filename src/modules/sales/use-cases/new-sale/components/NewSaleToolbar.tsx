import React from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewSaleContext } from '../NewSaleContext';

export const NewSaleToolbar = () => {
  const { 
    setIsAddProductModalOpen, 
    handleSaveSale, 
    saving, 
    selectedItems 
  } = useNewSaleContext();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold">Nueva Venta</h2>
        <p className="text-sm text-muted-foreground">Agrega productos para crear una nueva venta.</p>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          onClick={() => setIsAddProductModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
        
        <Button 
          onClick={handleSaveSale}
          disabled={saving || selectedItems.length === 0}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Completar Venta
        </Button>
      </div>
    </div>
  );
};
