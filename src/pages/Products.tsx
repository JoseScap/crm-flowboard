import { Package, Plus, Pencil, Trash2, Search, AlertTriangle, FolderOpen, X, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useProductsForPage } from '@/hooks/use-products-for-page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Products() {
  const {
    // Product states
    products,
    loading,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    formData,
    setFormData,
    filteredProducts,
    
    // Category states
    showCategories,
    setShowCategories,
    categories,
    isAddingCategory,
    newCategoryName,
    setNewCategoryName,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    categoryToDelete,
    editingCategory,
    editingCategoryName,
    setEditingCategoryName,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalProducts,
    totalPages,
    startIndex,
    endIndex,
    
    // Stock filter states
    lowStockCount,
    showLowStockOnly,
    outOfStockCount,
    showOutOfStockOnly,
    
    // Handlers
    handleAddCategory,
    handleCancelAddCategory,
    handleSaveCategory,
    handleDeleteCategory,
    handleConfirmDelete,
    handleCancelDelete,
    handleEditCategory,
    handleCancelEdit,
    handleSaveEdit,
    getStockStatus,
    handleOpenDialog,
    handleSave,
    handleDelete,
    handleViewLowStock,
    handleViewOutOfStock,
    handleViewAll,
  } = useProductsForPage();


  return (
    <div className="p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Manage your product inventory and stock levels</p>
      </header>

      {lowStockCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-foreground">
              <strong>{lowStockCount}</strong> product(s) with low stock
            </span>
          </div>
          {!showLowStockOnly && !showOutOfStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewLowStock}
              className="text-amber-600 border-amber-500 hover:bg-amber-500 hover:text-white"
            >
              View Low Stock Products
            </Button>
          )}
          {showLowStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
            >
              View All Products
            </Button>
          )}
        </div>
      )}

      {outOfStockCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-foreground">
              <strong>{outOfStockCount}</strong> product(s) out of stock
            </span>
          </div>
          {!showOutOfStockOnly && !showLowStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOutOfStock}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              View Out of Stock Products
            </Button>
          )}
          {showOutOfStockOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
            >
              View All Products
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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
            Manage Categories
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'New Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {showCategories && (
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
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Loading categories...</span>
                </div>
              </div>
            ) : (
              <>
                {categories.map((category) => (
                  editingCategory?.id === category.id ? (
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
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveEdit}
                        className="h-8 w-8"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
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
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock, product.minimum_stock);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>{product.product_categories?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={product.minimum_stock !== null && product.minimum_stock > 0 && product.stock <= product.minimum_stock ? 'text-amber-500 font-medium' : ''}>
                          {product.stock}
                        </span>
                        {product.minimum_stock !== null && product.minimum_stock > 0 && (
                          <span className="text-muted-foreground text-sm"> / {product.minimum_stock} min</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalProducts > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page" className="text-sm text-muted-foreground">
              Items per page:
            </Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="items-per-page" className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {totalProducts} products
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-foreground px-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-9 w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
