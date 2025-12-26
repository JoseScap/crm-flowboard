import { ProductsHomeProvider } from '@/modules/products/use-cases/products-home/ProductsHomeContext';
import { ProductHomeStockAlerts } from './components/ProductHomeStockAlerts';
import { ProductHomeToolbar } from './components/ProductHomeToolbar';
import { ProductHomeCategoriesSection } from './components/ProductHomeCategoriesSection';
import { ProductHomeTable } from './components/ProductHomeTable';
import { ProductHomePagination } from './components/ProductHomePagination';
import { ProductHomeDialogs } from './components/ProductHomeDialogs';

const ProductsHome = () => {
  return (
    <div className="p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Manage your product inventory and stock levels</p>
      </header>
      <ProductHomeStockAlerts />
      <ProductHomeToolbar />
      <ProductHomeCategoriesSection />
      <ProductHomeTable />
      <ProductHomePagination />
      <ProductHomeDialogs />
    </div>
  );
}

const ProductsHomePage = () => {
  return (
    <ProductsHomeProvider>
      <ProductsHome />
    </ProductsHomeProvider>
  );
}

export default ProductsHomePage;