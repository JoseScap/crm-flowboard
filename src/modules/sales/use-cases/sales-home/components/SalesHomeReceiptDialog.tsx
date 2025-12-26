import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSalesHomeContext } from '../SalesHomeContext';

export function SalesHomeReceiptDialog() {
  const {
    cart,
    showReceipt,
    setShowReceipt,
    processedSale,
    handleCloseReceipt,
  } = useSalesHomeContext();

  return (
    <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recibo de Venta
          </DialogTitle>
        </DialogHeader>
        {processedSale && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {processedSale.order_number.toLocaleString()}
            </p>
            <Separator />
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    $
                    {(
                      parseFloat(item.price) * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                $
                {processedSale.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={handleCloseReceipt}
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

