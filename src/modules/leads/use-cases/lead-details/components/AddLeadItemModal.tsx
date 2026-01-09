import React from 'react';
import { Search, Plus, Loader2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useLeadDetailsContext } from '../LeadDetailsContext';
import { Badge } from '@/components/ui/badge';

export const AddLeadItemModal = () => {
  const { 
    isAddProductModalOpen, 
    setIsAddProductModalOpen, 
    availableProducts, 
    loadingItems, 
    searchTerm, 
    setSearchTerm,
    handleAddProduct,
    leadItems
  } = useLeadDetailsContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isProductSelected = (productId: number) => {
    return leadItems.some(item => item.product_id === productId);
  };

  return (
    <Dialog open={isAddProductModalOpen} onOpenChange={setIsAddProductModalOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Products to Lead</DialogTitle>
          <DialogDescription>
            Search and select products to add to this lead's proposal.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingItems ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : availableProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                availableProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{product.sku}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock <= (product.minimum_stock || 0) ? 'destructive' : 'outline'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isProductSelected(product.id) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleAddProduct({
                          product_id: product.id,
                          name: product.name,
                          sku: product.sku,
                          price: product.price,
                          quantity: 1,
                          business_id: product.business_id,
                          lead_id: 0
                        })}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {isProductSelected(product.id) ? "Add More" : "Add"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setIsAddProductModalOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
