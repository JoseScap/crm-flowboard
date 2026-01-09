import React from 'react';
import { NewSaleProvider } from './NewSaleContext';
import { NewSaleToolbar } from './components/NewSaleToolbar';
import { NewSaleTable } from './components/NewSaleTable';
import { AddProductModal } from './components/AddProductModal';

const NewSale = () => {
  return (
    <div className="p-6 space-y-6">
      <NewSaleToolbar />
      <NewSaleTable />
      <AddProductModal />
    </div>
  );
};

const NewSalePage = () => {
  return (
    <NewSaleProvider>
      <NewSale />
    </NewSaleProvider>
  );
};

export default NewSalePage;
