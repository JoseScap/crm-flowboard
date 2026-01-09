import React from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSalesHomeContext } from '../SalesHomeContext';
import { useNavigate, useParams } from 'react-router-dom';

export const SalesHomeToolbar = () => {
  const { searchTerm, setSearchTerm, refreshData, loadingData } = useSalesHomeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const businessId = id ? parseInt(id, 10) : null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order #..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="default" onClick={() => navigate(`/user/businesses/${businessId}/sales/new`)}>
          <Plus className="h-4 w-4" />
          Nueva Venta
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshData}
          disabled={loadingData}
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
