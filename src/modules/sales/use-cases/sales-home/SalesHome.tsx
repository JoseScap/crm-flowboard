import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Receipt,
  Loader2,
} from "lucide-react";
import { SalesHomeProvider, useSalesHomeContext } from "@/modules/sales/use-cases/sales-home/SalesHomeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SalesHome = () => {
  const {
    // Loading state
    loadingData,

    // Cart states
    cart,
    searchTerm,
    setSearchTerm,
    showReceipt,
    setShowReceipt,
    
    // Product states
    products,
    
    // Tax states
    applyTax,
    setApplyTax,
    taxPercentage,
    setTaxPercentage,
    
    // Sales states
    saleDetails,
    processedSale,
    
    // Handlers
    handleAddProductToCart,
    handleUpdateProductQuantity,
    handleRemoveProductFromCart,
    handleResetCart,
    handleProcessSale,
    handleCloseReceipt,
  } = useSalesHomeContext();

  return (
      <div className="p-6 h-full">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
          <p className="text-muted-foreground mt-1">
            Selecciona productos y procesa la venta
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-100px)]">
          {/* Products Section */}
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

          {/* Cart Section */}
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
        </div>

        {/* Receipt Dialog */}
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
      </div>
    );
}

const SalesHomePage = () => {
  return (
    <SalesHomeProvider>
      <SalesHome />
    </SalesHomeProvider>
  );
};

export default SalesHomePage;