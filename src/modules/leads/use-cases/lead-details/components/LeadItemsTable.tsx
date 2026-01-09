import React from 'react';
import { Trash2, Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeadDetailsContext } from '../LeadDetailsContext';
import { Separator } from '@/components/ui/separator';

export const LeadItemsTable = () => {
  const { 
    leadItems, 
    handleRemoveProduct, 
    handleUpdateQuantity,
    subtotal,
    handleProcessSale,
    isProcessingSale,
    setIsAddProductModalOpen
  } = useLeadDetailsContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (leadItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-md bg-muted/20 border-dashed">
        <ShoppingCart className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No hay artículos en este lead</p>
        <p className="text-sm text-muted-foreground mb-4">Agrega productos para comenzar a crear una propuesta</p>
        <Button onClick={() => setIsAddProductModalOpen(true)} variant="outline">
          Agregar productos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Artículos del Lead</h3>
        <Button onClick={() => setIsAddProductModalOpen(true)} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar producto
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-center w-[150px]">Cantidad</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leadItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      type="number" 
                      className="h-8 w-16 text-center"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveProduct(item.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-end gap-4">
        <div className="w-full max-w-[300px] space-y-3 bg-card border rounded-lg p-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <Separator />
          <Button 
            className="w-full" 
            onClick={handleProcessSale}
            disabled={isProcessingSale || leadItems.length === 0}
          >
            {isProcessingSale ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Procesar venta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
