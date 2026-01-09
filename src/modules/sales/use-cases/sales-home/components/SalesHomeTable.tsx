import React from 'react';
import { 
  ReceiptText, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSalesHomeContext, SaleWithDetails } from '../SalesHomeContext';
import { formatDate } from '@/modules/common/lib/date-utils';
import { Tables } from '@/modules/types/supabase.schema';

export const SalesHomeTable = () => {
  const { 
    sales, 
    loadingData, 
    sortSalesBy, 
    sortSalesAscending, 
    handleChangeSortSalesBy,
    setSelectedSale,
    setIsDetailsDialogOpen
  } = useSalesHomeContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderSortIcon = (field: keyof Tables<'sales'>) => {
    if (sortSalesBy !== field) return null;
    return sortSalesAscending ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" />
    );
  };

  const handleViewDetails = (sale: SaleWithDetails) => {
    setSelectedSale(sale);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortSalesBy('created_at')}
            >
              Fecha {renderSortIcon('created_at')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortSalesBy('order_number')}
            >
              Pedido {renderSortIcon('order_number')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => handleChangeSortSalesBy('total')}
            >
              Total {renderSortIcon('total')}
            </TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Activo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingData ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Cargando ventas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(sale.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <ReceiptText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">#{sale.order_number}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sale.total)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.business_employees 
                      ? `${sale.business_employees.first_name} ${sale.business_employees.last_name}`
                      : 'Desconocido'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sale.is_open ? 'outline' : 'default'} className={sale.is_open ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                      {sale.is_open ? 'Abierto' : 'Completado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sale.is_active ? 'default' : 'secondary'}>
                      {sale.is_active ? 'Activo' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewDetails(sale)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron ventas
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
