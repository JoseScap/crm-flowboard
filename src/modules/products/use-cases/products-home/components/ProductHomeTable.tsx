import { Package, Pencil, Power, PowerOff, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductsHomeContext } from '../ProductsHomeContext';
import { Tables } from '@/modules/types/supabase.schema';

export function ProductHomeTable() {
  const {
    loadingData,
    products,
    getStockStatus,
    handleEditProduct,
    toggleActiveStatus,
    sortProductsBy,
    sortProductsAscending,
    handleChangeSortProductsBy,
  } = useProductsHomeContext();

  const renderSortIcon = (field: keyof Tables<'products'>) => {
    if (sortProductsBy !== field) return null;
    return sortProductsAscending ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" />
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortProductsBy('name')}
            >
              Product {renderSortIcon('name')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortProductsBy('sku')}
            >
              SKU {renderSortIcon('sku')}
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortProductsBy('price')}
            >
              Precio {renderSortIcon('price')}
            </TableHead>
            <TableHead 
              className="text-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortProductsBy('stock')}
            >
              Stock {renderSortIcon('stock')}
            </TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead 
              className="text-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortProductsBy('is_active')}
            >
              Active {renderSortIcon('is_active')}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingData ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Loading products...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {products.map((product) => {
                const status = getStockStatus(product.stock, product.minimum_stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>{product.product_categories?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={product.minimum_stock !== null && product.minimum_stock > 0 && product.stock <= product.minimum_stock ? 'text-amber-500 font-medium' : ''}>
                        {product.stock}
                      </span>
                      {product.minimum_stock !== null && product.minimum_stock > 0 && (
                        <span className="text-muted-foreground text-sm"> / {product.minimum_stock} min</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActiveStatus(product)}
                          title={product.is_active ? 'Deactivate product' : 'Activate product'}
                        >
                          {product.is_active ? (
                            <PowerOff className="w-4 h-4 text-red-500" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

