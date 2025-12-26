import { SalesHomeProvider } from '@/modules/sales/use-cases/sales-home/SalesHomeContext';
import { SalesHomeProductGrid } from './components/SalesHomeProductGrid';
import { SalesHomeCart } from './components/SalesHomeCart';
import { SalesHomeReceiptDialog } from './components/SalesHomeReceiptDialog';

const SalesHome = () => {
  return (
    <div className="p-6 h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
        <p className="text-muted-foreground mt-1">
          Selecciona productos y procesa la venta
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-100px)]">
        <SalesHomeProductGrid />
        <SalesHomeCart />
      </div>

      <SalesHomeReceiptDialog />
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