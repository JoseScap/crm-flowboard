import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalesHomeContext } from '../SalesHomeContext';
import { formatDate } from '@/modules/common/lib/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export const SalesHomeDetailsDialog = () => {
  const { 
    isDetailsDialogOpen, 
    setIsDetailsDialogOpen, 
    selectedSale, 
    saleSnapshots, 
    loadingSnapshots 
  } = useSalesHomeContext();

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  if (!selectedSale) return null;

  // The applied_tax in DB stores the percentage (e.g. 21)
  const taxAmount = selectedSale.subtotal * (selectedSale.applied_tax / 100);

  return (
    <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details #{selectedSale.order_number}</DialogTitle>
          <DialogDescription>
            Created on {formatDate(selectedSale.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Details</h4>
            <p className="font-medium">Order #{selectedSale.order_number}</p>
            <p className="text-sm text-muted-foreground">{formatDate(selectedSale.created_at)}</p>
            <div className="mt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salesperson</h4>
              <p className="text-sm font-medium">
                {selectedSale.business_employees 
                  ? `${selectedSale.business_employees.first_name} ${selectedSale.business_employees.last_name}`
                  : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</h4>
            <p className="font-medium">{selectedSale.is_open ? 'Open' : 'Completed'}</p>
            {!selectedSale.is_active && <p className="text-sm text-destructive font-medium">Cancelled</p>}
          </div>
        </div>

        <Separator />

        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-3">Products</h4>
          {loadingSnapshots ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleSnapshots.map((snapshot) => (
                    <TableRow key={snapshot.id}>
                      <TableCell>
                        <div className="font-medium">{snapshot.name}</div>
                        <div className="text-xs text-muted-foreground">{snapshot.sku}</div>
                      </TableCell>
                      <TableCell className="text-center">{snapshot.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(snapshot.price)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(snapshot.price) * snapshot.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {saleSnapshots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No products found for this sale.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 mt-6">
          <div className="flex justify-between w-full max-w-[240px] text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(selectedSale.subtotal)}</span>
          </div>
          {selectedSale.applied_tax > 0 && (
            <div className="flex justify-between w-full max-w-[240px] text-sm">
              <span className="text-muted-foreground">Tax ({selectedSale.applied_tax}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <Separator className="w-full max-w-[240px] my-1" />
          <div className="flex justify-between w-full max-w-[240px] font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(selectedSale.total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
