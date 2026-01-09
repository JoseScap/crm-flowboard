import { Search, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductsHomeContext } from '../ProductsHomeContext';

export function ProductHomeToolbar() {
  const {
    searchTerm,
    setSearchTerm,
    showCategories,
    setShowCategories,
    handleAddProduct,
  } = useProductsHomeContext();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={() => setShowCategories(!showCategories)}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Gestionar Categorías
        </Button>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>
    </div>
  );
}

