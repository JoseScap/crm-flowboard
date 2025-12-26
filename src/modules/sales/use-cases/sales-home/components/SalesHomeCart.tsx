import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSalesHomeContext } from '../SalesHomeContext';

export function SalesHomeCart() {
  const {
    cart,
    saleDetails,
    applyTax,
    setApplyTax,
    taxPercentage,
    setTaxPercentage,
    handleUpdateProductQuantity,
    handleRemoveProductFromCart,
    handleResetCart,
    handleProcessSale,
  } = useSalesHomeContext();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Carrito
          {saleDetails.totalItems > 0 && (
            <Badge className="ml-auto">{saleDetails.totalItems} items</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Carrito vacío
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toLocaleString()} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProductQuantity(item.product_id, -1);
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProductQuantity(item.product_id, 1);
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProductFromCart(item.product_id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${saleDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  id="apply-tax"
                  checked={applyTax}
                  onCheckedChange={(checked) =>
                    setApplyTax(checked === true)
                  }
                />
                <Label
                  htmlFor="apply-tax"
                  className="text-sm cursor-pointer"
                >
                  Agregar impuesto
                </Label>
              </div>
              {applyTax && (
                <div className="flex items-center gap-2 pb-2">
                  <Input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    placeholder="%"
                    className="w-20 h-8"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
              {applyTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Impuesto ({taxPercentage}%)
                  </span>
                  <span>
                    $
                    {saleDetails.tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  $
                  {saleDetails.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full" size="lg" onClick={handleProcessSale}>
                <CreditCard className="w-4 h-4 mr-2" />
                Procesar Venta
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetCart}
              >
                Vaciar Carrito
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

