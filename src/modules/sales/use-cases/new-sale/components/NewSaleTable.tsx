import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
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
import { useNewSaleContext } from '../NewSaleContext';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NewSaleTable = () => {
  const { 
    selectedItems, 
    removeItem, 
    updateQuantity,
    subtotal,
    isTaxEnabled,
    setIsTaxEnabled,
    taxRate,
    setTaxRate,
    tax,
    total
  } = useNewSaleContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (selectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-md bg-muted/20 border-dashed">
        <p className="text-muted-foreground text-lg">No products added yet</p>
        <p className="text-sm text-muted-foreground">Click "Add Product" to start building the sale</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center w-[150px]">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedItems.map((item) => (
              <TableRow key={item.product_id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(item.price))}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      type="number" 
                      className="h-8 w-16 text-center"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value, 10) || 0)}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.product_id)}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex flex-col gap-4 bg-card border rounded-lg p-4 w-full sm:w-auto min-w-[240px]">
          <div className="flex items-center space-x-2">
            <Switch 
              id="tax-toggle" 
              checked={isTaxEnabled} 
              onCheckedChange={setIsTaxEnabled} 
            />
            <Label htmlFor="tax-toggle">Apply Tax</Label>
          </div>
          
          {isTaxEnabled && (
            <div className="space-y-2">
              <Label htmlFor="tax-rate" className="text-xs text-muted-foreground">Tax Percentage (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tax-rate"
                  type="number"
                  className="h-8 w-20"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <span className="text-sm font-medium">%</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-[300px] space-y-3 bg-card border rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {isTaxEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
