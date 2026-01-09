import { ProductsHomeProvider } from '@/modules/products/use-cases/products-home/ProductsHomeContext';
import { ProductHomeToolbar } from './components/ProductHomeToolbar';
import { ProductHomeCategoriesSection } from './components/ProductHomeCategoriesSection';
import { ProductHomeTable } from './components/ProductHomeTable';
import { ProductHomePagination } from './components/ProductHomePagination';
import { ProductHomeDialogs } from './components/ProductHomeDialogs';

const ProductsHome = () => {
  return (
    <div className="p-6 space-y-6">
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