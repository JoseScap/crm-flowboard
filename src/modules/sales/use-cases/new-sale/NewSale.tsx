import React from 'react';
import { NewSaleProvider } from './NewSaleContext';
import { NewSaleToolbar } from './components/NewSaleToolbar';
import { NewSaleTable } from './components/NewSaleTable';
import { AddProductModal } from './components/AddProductModal';

const NewSale = () => {
  return (
    <>
      <NewSaleToolbar />
      <NewSaleTable />
      <AddProductModal />
    </>
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
