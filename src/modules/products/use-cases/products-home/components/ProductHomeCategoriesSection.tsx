import { FolderOpen, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductsHomeContext } from '../ProductsHomeContext';

export function ProductHomeCategoriesSection() {
  const {
    showCategories,
    setShowCategories,
    categories,
    loadingData,
    isAddingCategory,
    newCategoryName,
    setNewCategoryName,
    editingCategory,
    editingCategoryName,
    setEditingCategoryName,
    handleAddCategory,
    handleCancelAddCategory,
    handleSaveCategory,
    handleDeleteCategory,
    handleEditCategory,
    handleCancelEditCategory,
    handleSaveEditCategory,
  } = useProductsHomeContext();

  if (!showCategories) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Categories</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowCategories(false)}
        >
          Hide
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {loadingData ? (
          <div className="col-span-3 flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading categories...</span>
            </div>
          </div>
        ) : (
          <>
            {categories.map((category) => (
              editingCategory && editingCategory.id === category.id ? (
                <div key={category.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEditCategory();
                        } else if (e.key === 'Escape') {
                          handleCancelEditCategory();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveEditCategory}
                      className="h-8 w-8"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEditCategory}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={category.id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group relative"
                >
                  <div className="flex items-center gap-2 pr-16">
                    <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-10 -translate-y-1/2 h-6 w-6 hover:bg-primary transition-colors [&:hover_svg]:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary transition-colors" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2 h-6 w-6 hover:bg-destructive transition-colors [&:hover_svg]:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive transition-colors" />
                  </Button>
                </div>
              )
            ))}
            {isAddingCategory && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveCategory();
                      } else if (e.key === 'Escape') {
                        handleCancelAddCategory();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveCategory}
                    className="h-8 w-8"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelAddCategory}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {!isAddingCategory && (
              <div 
                className="bg-card border border-border border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={handleAddCategory}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="font-medium text-foreground">Add Category</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

