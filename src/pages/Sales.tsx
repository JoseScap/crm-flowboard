import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const availableProducts: Product[] = [
  { id: '1', name: 'Laptop Pro 15"', sku: 'LAP-001', category: 'Electronics', price: 1299, stock: 25 },
  { id: '2', name: 'Wireless Mouse', sku: 'MOU-002', category: 'Accessories', price: 49, stock: 150 },
  { id: '3', name: 'USB-C Hub', sku: 'HUB-003', category: 'Accessories', price: 79, stock: 8 },
  { id: '4', name: 'Monitor 27"', sku: 'MON-004', category: 'Electronics', price: 399, stock: 42 },
  { id: '5', name: 'Keyboard Mechanical', sku: 'KEY-005', category: 'Accessories', price: 129, stock: 67 },
  { id: '6', name: 'Webcam HD', sku: 'CAM-006', category: 'Electronics', price: 89, stock: 3 },
  { id: '7', name: 'Headphones Wireless', sku: 'HEAD-007', category: 'Electronics', price: 199, stock: 34 },
  { id: '8', name: 'Mouse Pad XL', sku: 'PAD-008', category: 'Accessories', price: 29, stock: 89 },
];

export default function Sales() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{ items: CartItem[]; total: number; date: Date } | null>(null);

  const filteredProducts = availableProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock === 0) {
        toast.error('Producto sin stock');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} agregado`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) {
          toast.error('Stock insuficiente');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const processSale = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    
    setLastSale({
      items: [...cart],
      total,
      date: new Date(),
    });
    setShowReceipt(true);
    setCart([]);
    toast.success('Venta procesada exitosamente');
  };

  return (
    <div className="p-6 h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
        <p className="text-muted-foreground mt-1">Selecciona productos y procesa la venta</p>
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

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-auto flex-1">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                  product.stock === 0 ? 'opacity-50' : ''
                }`}
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <p className="text-lg font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrito
              {totalItems > 0 && (
                <Badge className="ml-auto">{totalItems} items</Badge>
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
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
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
                            updateQuantity(item.id, -1);
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, 1);
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
                            removeFromCart(item.id);
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
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button className="w-full" size="lg" onClick={processSale}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procesar Venta
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
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
          {lastSale && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {lastSale.date.toLocaleString()}
              </p>
              <Separator />
              <div className="space-y-2">
                {lastSale.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${lastSale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Button className="w-full" onClick={() => setShowReceipt(false)}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
