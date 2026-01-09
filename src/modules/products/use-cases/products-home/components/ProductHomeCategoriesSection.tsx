import { FolderOpen, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductsHomeContext } from '../ProductsHomeContext';

export function ProductHomeCategoriesSection() {
  const {
    showCategories,
    setShowCategories,
    categories,
    loadingData,
    handleAddCategory,
    handleDeleteCategory,
    handleEditCategory,
  } = useProductsHomeContext();

  if (!showCategories) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Categorías</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowCategories(false)}
        >
          Ocultar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loadingData ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Cargando categorías...</span>
            </div>
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group relative"
              >
                <div className="flex items-center gap-3 pr-20">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div 
              className="bg-card border border-border border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group flex items-center justify-center min-h-[74px]"
              onClick={handleAddCategory}
            >
              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nueva Categoría</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

