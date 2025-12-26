import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSalesHomeContext } from '../SalesHomeContext';

export function SalesHomeProductGrid() {
  const {
    loadingData,
    products,
    searchTerm,
    setSearchTerm,
    handleAddProductToCart,
  } = useSalesHomeContext();

  return (
    <div className="lg:col-span-2 flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-4 grid-rows-2 gap-3 flex-1">
        {loadingData ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">
                Loading products...
              </span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
            <p>No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                product.stock === 0 ? "opacity-50" : ""
              }`}
              onClick={() => handleAddProductToCart(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="text-xs">
                      {product.product_categories?.name || "N/A"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {product.sku}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

