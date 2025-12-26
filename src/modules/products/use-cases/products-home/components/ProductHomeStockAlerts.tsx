import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductsForPage } from '../ProductsHomeContext';

export function ProductHomeStockAlerts() {
  const {
    lowStockCount,
    showLowStockOnly,
    outOfStockCount,
    showOutOfStockOnly,
    handleViewLowStockProducts,
    handleViewOutOfStockProducts,
    handleViewAllProducts,
  } = useProductsForPage();

  return (
    <>
      {lowStockCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-foreground">
              <strong>{lowStockCount}</strong> product(s) with low stock
            </span>
          </div>
          {!showLowStockOnly && !showOutOfStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewLowStockProducts}
              className="text-amber-600 border-amber-500 hover:bg-amber-500 hover:text-white"
            >
              View Low Stock Products
            </Button>
          )}
          {showLowStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllProducts}
            >
              View All Products
            </Button>
          )}
        </div>
      )}

      {outOfStockCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-foreground">
              <strong>{outOfStockCount}</strong> product(s) out of stock
            </span>
          </div>
          {!showOutOfStockOnly && !showLowStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOutOfStockProducts}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              View Out of Stock Products
            </Button>
          )}
          {showOutOfStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllProducts}
            >
              View All Products
            </Button>
          )}
        </div>
      )}
    </>
  );
}

