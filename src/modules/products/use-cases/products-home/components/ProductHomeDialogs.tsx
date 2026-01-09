import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    
    // Category create/edit dialogs
    isCreateCategoryDialogOpen,
    setIsCreateCategoryDialogOpen,
    newCategoryFormData,
    setNewCategoryFormData,
    isEditCategoryDialogOpen,
    setIsEditCategoryDialogOpen,
    editingCategoryFormData,
    setEditingCategoryFormData,
    
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
    handleSaveCategory,
    handleCancelAddCategory,
    handleSaveEditCategory,
    handleCancelEditCategory,
  } = useProductsHomeContext();

  return (
    <>
      {/* Create Category Dialog */}
      <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nombre *</Label>
              <Input
                id="category-name"
                placeholder="Ingrese el nombre de la categoría"
                value={newCategoryFormData.name || ''}
                onChange={(e) => setNewCategoryFormData({ ...newCategoryFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                placeholder="Ingrese una descripción (opcional)"
                value={newCategoryFormData.description || ''}
                onChange={(e) => setNewCategoryFormData({ ...newCategoryFormData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelAddCategory}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={!newCategoryFormData.name?.trim()}>
              Crear Categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          {editingCategoryFormData && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category-name">Nombre *</Label>
                <Input
                  id="edit-category-name"
                  placeholder="Ingrese el nombre de la categoría"
                  value={editingCategoryFormData.name || ''}
                  onChange={(e) => setEditingCategoryFormData({ ...editingCategoryFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category-description">Descripción</Label>
                <Textarea
                  id="edit-category-description"
                  placeholder="Ingrese una descripción (opcional)"
                  value={editingCategoryFormData.description || ''}
                  onChange={(e) => setEditingCategoryFormData({ ...editingCategoryFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelEditCategory}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditCategory} disabled={!editingCategoryFormData?.name?.trim()}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={isCreateProductDialogOpen} onOpenChange={setIsCreateProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Nombre *</Label>
              <Input
                id="create-name"
                placeholder="Ingrese el nombre del producto"
                value={newProductFormData.name || ''}
                onChange={(e) => setNewProductFormData({ ...newProductFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-sku">SKU *</Label>
                <Input
                  id="create-sku"
                  placeholder="Ingrese el SKU"
                  value={newProductFormData.sku || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, sku: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-category">Categoría</Label>
                <Select
                  value={newProductFormData.product_category_id ? String(newProductFormData.product_category_id) : 'N/A'}
                  onValueChange={(value) => setNewProductFormData({
                    ...newProductFormData, product_category_id: value === 'N/A' ? null : Number(value) })}
                >
                  <SelectTrigger id="create-category">
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N/A">N/A</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-price">Precio *</Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                placeholder="0.00"
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
                  placeholder="0"
                  value={newProductFormData.stock || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-minStock">Stock Mínimo</Label>
                <Input
                  id="create-minStock"
                  type="number"
                  placeholder="0"
                  value={newProductFormData.minimum_stock || ''}
                  onChange={(e) => setNewProductFormData({ ...newProductFormData, minimum_stock: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelAddProduct}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAddProduct}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {editingProductFormData && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  placeholder="Ingrese el nombre del producto"
                  value={editingProductFormData.name || ''}
                  onChange={(e) => setEditingProductFormData({ ...editingProductFormData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU *</Label>
                  <Input
                    id="edit-sku"
                    placeholder="Ingrese el SKU"
                    value={editingProductFormData.sku || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, sku: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Select
                    value={editingProductFormData.product_category_id ? String(editingProductFormData.product_category_id) : 'N/A'}
                    onValueChange={(value) => setEditingProductFormData({
                      ...editingProductFormData,
                      product_category_id: value === 'N/A' ? null : Number(value)
                    })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
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
                    placeholder="0"
                    value={editingProductFormData.stock || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minStock">Stock Mínimo</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    placeholder="0"
                    value={editingProductFormData.minimum_stock || ''}
                    onChange={(e) => setEditingProductFormData({ ...editingProductFormData, minimum_stock: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelEditProduct}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditProduct}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={isToggleStatusDialogOpen} onOpenChange={setIsToggleStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productToToggleStatus?.is_active ? 'Desactivar Producto' : 'Activar Producto'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              ¿Está seguro que desea {productToToggleStatus?.is_active ? 'desactivar' : 'activar'} el producto <strong>"{productToToggleStatus?.name}"</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelToggleStatus}>
              Cancelar
            </Button>
            <Button 
              variant={productToToggleStatus?.is_active ? 'destructive' : 'default'}
              onClick={handleConfirmToggleStatus}
            >
              {productToToggleStatus?.is_active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              ¿Está seguro que desea eliminar la categoría <strong>"{categoryToDelete?.name}"</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelDeleteCategory}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteCategory}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

