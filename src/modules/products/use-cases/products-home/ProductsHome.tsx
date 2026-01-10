import { ProductsHomeProvider } from '@/modules/products/use-cases/products-home/ProductsHomeContext';
import { ProductHomeToolbar } from './components/ProductHomeToolbar';
import { ProductHomeCategoriesSection } from './components/ProductHomeCategoriesSection';
import { ProductHomeTable } from './components/ProductHomeTable';
import { ProductHomePagination } from './components/ProductHomePagination';
import { ProductHomeDialogs } from './components/ProductHomeDialogs';

const ProductsHome = () => {
  return (
    <>
      <ProductHomeToolbar />
      <ProductHomeCategoriesSection />
      <ProductHomeTable />
      <ProductHomePagination />
      <ProductHomeDialogs />
    </>
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