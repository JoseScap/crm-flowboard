import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductsHomeContext } from '../ProductsHomeContext';

export function ProductHomeDialogs() {
  const {
    // Create product dialog
    isCreateProductDialogOpen,
    setIsCreateProductDialogOpen,
    newProductFormData,
    setNewProductFormData,
    
    // Edit product dialog
    isEditProductDialogOpen,
    setIsEditProductDialogOpen,
    editingProductFormData,
    setEditingProductFormData,
    
    // Toggle status dialog
    isToggleStatusDialogOpen,
    setIsToggleStatusDialogOpen,
    productToToggleStatus,
    
    // Category delete dialog
    isDeleteCategoryDialogOpen,
    setIsDeleteCategoryDialogOpen,
    categoryToDelete,
    
    // Handlers
    categories,
    handleSaveAddProduct,
    handleCancelAddProduct,
    handleSaveEditProduct,
    handleCancelEditProduct,
    handleConfirmToggleStatus,
    handleCancelToggleStatus,
    handleConfirmDeleteCategory,
    handleCancelDeleteCategory,
  } = useProductsHomeContext();

  return (
    <>
      {/* Create Product Dialog */}
      <Dialog open={isCreateProductDialogOpen} onOpenChange={setIsCreateProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={newProductFormData.name || ''}
                onChange={(e) => setNewProductFormData({ ...newProductFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-sku">SKU *</Label>
                <Input
                  id="create-sku"
                  value={newProductFormData.sku || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, sku: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={newProductFormData.product_category_id || 'N/A'}
                  onValueChange={(value) => setNewProductFormData({
                    ...newProductFormData, product_category_id: value === 'N/A' ? null : value })}
                >
                  <SelectTrigger id="create-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N/A">N/A</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-price">Price *</Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                value={newProductFormData.price || ''}
                onChange={(e) => setNewProductFormData({ ...newProductFormData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-stock">Stock *</Label>
                <Input
                  id="create-stock"
                  type="number"
                  value={newProductFormData.stock || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-minStock">Minimum Stock</Label>
                <Input
                  id="create-minStock"
                  type="number"
                  value={newProductFormData.minimum_stock || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, minimum_stock: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelAddProduct}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddProduct}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProductFormData && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editingProductFormData.name || ''}
                  onChange={(e) => setEditingProductFormData({ ...editingProductFormData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU *</Label>
                  <Input
                    id="edit-sku"
                    value={editingProductFormData.sku || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, sku: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingProductFormData.product_category_id || 'N/A'}
                    onValueChange={(value) => setEditingProductFormData({
                      ...editingProductFormData,
                      product_category_id: value === 'N/A' ? null : value
                    })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProductFormData.price || ''}
                  onChange={(e) => setEditingProductFormData({ ...editingProductFormData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock *</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProductFormData.stock || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minStock">Minimum Stock</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    value={editingProductFormData.minimum_stock || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, minimum_stock: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelEditProduct}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditProduct}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={isToggleStatusDialogOpen} onOpenChange={setIsToggleStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productToToggleStatus?.is_active ? 'Deactivate Product' : 'Activate Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              Are you sure you want to {productToToggleStatus?.is_active ? 'deactivate' : 'activate'} the product <strong>"{productToToggleStatus?.name}"</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelToggleStatus}>
              Cancel
            </Button>
            <Button 
              variant={productToToggleStatus?.is_active ? 'destructive' : 'default'}
              onClick={handleConfirmToggleStatus}
            >
              {productToToggleStatus?.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
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
            <Button variant="outline" onClick={handleCancelDeleteCategory}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteCategory}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

