import { SalesHomeProvider } from '@/modules/sales/use-cases/sales-home/SalesHomeContext';
import { SalesHomeToolbar } from './components/SalesHomeToolbar';
import { SalesHomeTable } from './components/SalesHomeTable';
import { SalesHomePagination } from './components/SalesHomePagination';
import { SalesHomeDetailsDialog } from './components/SalesHomeDetailsDialog';

const SalesHome = () => {
  return (
    <>
      <SalesHomeToolbar />
      <SalesHomeTable />
      <SalesHomePagination />
      <SalesHomeDetailsDialog />
    </>
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