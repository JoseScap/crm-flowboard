# Guía de Migración de Base de Datos Multi-Tenant

## Resumen

Esta guía describe la migración de una arquitectura single-tenant a multi-tenant donde:
- **Users** (de Supabase Auth) se extienden a través de la tabla `business_users`
- **business_users** es la tabla central que define la relación entre users y businesses
- Cuando un user crea un business, automáticamente se convierte en owner en `business_users`
- **Users** pueden estar asociados con múltiples **Businesses** y pueden ver datos de todos los businesses con los que están asociados
- **Businesses** gestionan sus propios **Products**, **Sales**, y **Pipelines**

## Diagrama de Arquitectura

```
auth.users (Supabase Auth)
  └── business_users (Tabla de Extensión - Relación Central)
       └── Businesses (N:M)
            ├── Pipelines (1:N)
            ├── Products (1:N)
            ├── Product Categories (1:N)
            └── Sales (1:N)
```

**Concepto Clave:** `business_users` es la extensión de `auth.users` y sirve como la única fuente de verdad para las relaciones user-business. Todo el acceso a datos se controla a través de esta tabla.

## Esquema de Base de Datos

### 1. Tabla Business Users (Tabla de Extensión Central)

**Esta es la tabla central que extiende `auth.users` y define todas las relaciones user-business.**

`business_users` sirve como la extensión de `auth.users` y es la única fuente de verdad para:
- Qué users tienen acceso a qué businesses
- Qué rol tiene cada user en cada business
- Todo el control de acceso a datos se basa en esta tabla

```sql
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee', -- Role: 'owner', 'admin', 'manager', 'employee'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
CREATE INDEX idx_business_users_role ON business_users(role);
```

**Puntos Clave:**
- Cuando un user crea un business, se agrega automáticamente a `business_users` con rol 'owner'
- Los users solo pueden ver y acceder a datos de businesses donde tienen un registro en `business_users`
- Esta tabla es la base para todas las políticas de Row Level Security (RLS)

**Flujo cuando un user crea un business:**
1. User crea un business → la tabla `businesses` obtiene un nuevo registro con `owner_id = user.id`
2. Se dispara el trigger → Crea automáticamente un registro en `business_users` con `role = 'owner'`
3. User ahora puede acceder al business → Todas las políticas RLS verifican `business_users` para acceso
4. User puede invitar a otros → Agregar registros a `business_users` con roles apropiados

### 2. Tabla Businesses

Unidades de negocio. El campo `owner_id` es una referencia para búsqueda rápida, pero la autorización se controla a través de `business_users`.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
```

**Nota:** El campo `owner_id` se mantiene como referencia, pero todo el control de acceso se hace a través de `business_users`. Cuando se crea un business, el owner se agrega automáticamente a `business_users` con rol 'owner' mediante un trigger.

### 5. Tablas Modificadas

#### Tabla Pipelines

```sql
-- Agregar columna business_id
ALTER TABLE pipelines 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Hacerla requerida después de la migración
-- ALTER TABLE pipelines ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_pipelines_business_id ON pipelines(business_id);
```

#### Tabla Product Categories

```sql
-- Agregar columna business_id
ALTER TABLE product_categories 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Agregar restricción única para name por business
ALTER TABLE product_categories 
ADD CONSTRAINT unique_category_name_per_business 
UNIQUE (business_id, name);

-- Hacerla requerida después de la migración
-- ALTER TABLE product_categories ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_product_categories_business_id ON product_categories(business_id);
```

#### Tabla Products

```sql
-- Agregar columna business_id
ALTER TABLE products 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Actualizar restricción única para SKU por business
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_sku_key; -- Eliminar restricción única antigua si existe

ALTER TABLE products 
ADD CONSTRAINT unique_sku_per_business 
UNIQUE (business_id, sku);

-- Hacerla requerida después de la migración
-- ALTER TABLE products ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_products_business_id ON products(business_id);
```

#### Tabla Sales

```sql
-- Agregar columna business_id
ALTER TABLE sales 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Actualizar restricción única para order_number por business
ALTER TABLE sales 
ADD CONSTRAINT unique_order_number_per_business 
UNIQUE (business_id, order_number);

-- Hacerla requerida después de la migración
-- ALTER TABLE sales ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX idx_sales_business_id ON sales(business_id);
```

## Implementación Paso a Paso en Supabase

### Paso 1: Crear Nuevas Tablas

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta lo siguiente en orden:

```sql
-- 1. Crear tabla businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);

-- 2. Crear tabla business_users (TABLA DE EXTENSIÓN CENTRAL)
-- Esta es la extensión de auth.users y define todas las relaciones user-business
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee', -- 'owner', 'admin', 'manager', 'employee'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
CREATE INDEX idx_business_users_role ON business_users(role);
```

### Paso 2: Crear Trigger para Agregar Automáticamente Owner a business_users

Cuando se crea un business, agregar automáticamente el owner a `business_users` con rol 'owner'. Esto asegura que `business_users` siempre sea la fuente de verdad para el control de acceso.

```sql
-- Función para agregar automáticamente owner a business_users
CREATE OR REPLACE FUNCTION add_business_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Agregar automáticamente el owner a business_users cuando se crea un business
  INSERT INTO business_users (business_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (business_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función después de crear un business
CREATE TRIGGER on_business_created
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION add_business_owner();
```

### Paso 3: Crear Business por Defecto para Users Existentes

Para users existentes que ya tienen datos, crear un business por defecto:

```sql
-- Crear un business por defecto para cada user existente
-- Esto asume que tienes datos existentes que necesitan ser migrados
-- Reemplaza 'YOUR_USER_ID_HERE' con IDs de users reales de auth.users

-- Primero, obtener una lista de users que necesitan businesses por defecto
-- Luego crear businesses para ellos:

INSERT INTO businesses (id, owner_id, name, is_active)
SELECT 
  gen_random_uuid(),
  id as owner_id,
  'Default Business' as name,
  true as is_active
FROM auth.users
WHERE id NOT IN (SELECT owner_id FROM businesses)
RETURNING id, owner_id;

-- Nota: El trigger agregará automáticamente los owners a business_users
-- Guarda los business_ids devueltos para el siguiente paso
```

### Paso 3: Agregar business_id a Tablas Existentes

**Importante:** Si tienes datos existentes, necesitarás asignarlos a businesses. Puedes:
- Asignar todos los datos existentes a un business por defecto por user
- O asignar manualmente los datos a businesses específicos

```sql
-- Agregar business_id a pipelines
ALTER TABLE pipelines 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Para datos existentes: Asignar pipelines al business por defecto del owner
-- Esto asume que cada user tiene al menos un business
UPDATE pipelines p
SET business_id = (
  SELECT b.id 
  FROM businesses b 
  WHERE b.owner_id = (
    -- Puedes necesitar determinar el owner basándote en tu estructura de datos
    -- Esto es un placeholder - ajusta según tus necesidades
    SELECT id FROM auth.users LIMIT 1
  )
  LIMIT 1
)
WHERE business_id IS NULL;

CREATE INDEX idx_pipelines_business_id ON pipelines(business_id);

-- Agregar business_id a product_categories
ALTER TABLE product_categories 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Para datos existentes: Asignar categorías al business por defecto
UPDATE product_categories pc
SET business_id = (
  SELECT b.id 
  FROM businesses b 
  LIMIT 1
)
WHERE business_id IS NULL;

ALTER TABLE product_categories 
ADD CONSTRAINT unique_category_name_per_business 
UNIQUE (business_id, name);

CREATE INDEX idx_product_categories_business_id ON product_categories(business_id);

-- Agregar business_id a products
ALTER TABLE products 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Para datos existentes: Asignar products al business por defecto
UPDATE products p
SET business_id = (
  SELECT b.id 
  FROM businesses b 
  LIMIT 1
)
WHERE business_id IS NULL;

-- Eliminar restricción única antigua de SKU si existe
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_sku_key;

ALTER TABLE products 
ADD CONSTRAINT unique_sku_per_business 
UNIQUE (business_id, sku);

CREATE INDEX idx_products_business_id ON products(business_id);

-- Agregar business_id a sales
ALTER TABLE sales 
ADD COLUMN business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Para datos existentes: Asignar sales al business por defecto
UPDATE sales s
SET business_id = (
  SELECT b.id 
  FROM businesses b 
  LIMIT 1
)
WHERE business_id IS NULL;

ALTER TABLE sales 
ADD CONSTRAINT unique_order_number_per_business 
UNIQUE (business_id, order_number);

CREATE INDEX idx_sales_business_id ON sales(business_id);
```

**Nota:** Las declaraciones UPDATE anteriores son placeholders. Necesitarás ajustarlas basándote en cómo quieres asignar los datos existentes a businesses. Si tienes una forma de identificar qué user posee qué datos, úsala para asignar al business correcto.

### Paso 4: Hacer Columnas business_id Requeridas

```sql
-- Después de verificar que todos los datos han sido migrados, hacer las columnas NOT NULL

ALTER TABLE pipelines 
ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE product_categories 
ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE products 
ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE sales 
ALTER COLUMN business_id SET NOT NULL;
```

### Paso 5: Actualizar Views

Actualizar las views existentes para filtrar por business_id:

```sql
-- Eliminar y recrear view products_low_stock
DROP VIEW IF EXISTS products_low_stock;

CREATE VIEW products_low_stock AS
SELECT 
  p.*
FROM products p
WHERE p.is_active = true
  AND p.minimum_stock IS NOT NULL
  AND p.stock <= p.minimum_stock
  AND p.stock > 0;

-- Eliminar y recrear view products_out_of_stock
DROP VIEW IF EXISTS products_out_of_stock;

CREATE VIEW products_out_of_stock AS
SELECT 
  p.*
FROM products p
WHERE p.is_active = true
  AND p.stock = 0;

-- Actualizar view products_low_stock_total
DROP VIEW IF EXISTS products_low_stock_total;

CREATE VIEW products_low_stock_total AS
SELECT COUNT(*) as count
FROM products_low_stock;

-- Actualizar view products_out_of_stock_total
DROP VIEW IF EXISTS products_out_of_stock_total;

CREATE VIEW products_out_of_stock_total AS
SELECT COUNT(*) as count
FROM products_out_of_stock;
```

### Paso 6: Actualizar Funciones

Actualizar la función `process_sale` para incluir business_id:

```sql
-- Primero, verificar la definición actual de la función
-- Luego actualizarla para aceptar el parámetro business_id

CREATE OR REPLACE FUNCTION process_sale(
  p_business_id UUID,
  p_applied_tax NUMERIC,
  p_cart_items JSONB
)
RETURNS TABLE (
  applied_tax_result NUMERIC,
  order_number INTEGER,
  subtotal NUMERIC,
  total NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_number INTEGER;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC;
  v_item JSONB;
BEGIN
  -- Obtener siguiente número de orden para este business
  SELECT COALESCE(MAX(order_number), 0) + 1
  INTO v_order_number
  FROM sales
  WHERE business_id = p_business_id;

  -- Calcular subtotal desde cart_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'price')::NUMERIC * (v_item->>'quantity')::INTEGER;
  END LOOP;

  -- Calcular total con impuesto
  v_total := v_subtotal + (v_subtotal * p_applied_tax / 100);

  RETURN QUERY SELECT 
    p_applied_tax,
    v_order_number,
    v_subtotal,
    v_total;
END;
$$;
```

### Paso 7: Habilitar Row Level Security (RLS)

Habilitar RLS en todas las tablas:

```sql
-- Habilitar RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stage_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_snapshots ENABLE ROW LEVEL SECURITY;
```

### Paso 8: Crear Políticas RLS

Crear función helper para obtener business_ids accesibles por el user actual. Esta función se basa completamente en la tabla `business_users`:

```sql
-- Función para obtener business_ids accesibles por el user actual
-- Basada completamente en la tabla business_users (la extensión de auth.users)
CREATE OR REPLACE FUNCTION get_accessible_business_ids()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_business_ids UUID[];
BEGIN
  -- Obtener todos los businesses donde el user tiene un registro en business_users
  SELECT ARRAY_AGG(DISTINCT bu.business_id)
  INTO v_business_ids
  FROM business_users bu
  INNER JOIN businesses b ON b.id = bu.business_id
  WHERE bu.user_id = auth.uid()
    AND b.is_active = true;
  
  RETURN COALESCE(v_business_ids, ARRAY[]::UUID[]);
END;
$$;
```

Crear políticas RLS. Todas las políticas se basan en la tabla `business_users`:

```sql
-- Businesses: Users pueden ver businesses donde tienen un registro en business_users
CREATE POLICY "Users can view their businesses"
ON businesses FOR SELECT
USING (
  id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid()
  )
);

-- Businesses: Users pueden crear businesses (se convierten en owner mediante trigger)
CREATE POLICY "Users can create businesses"
ON businesses FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Businesses: Solo users con rol 'owner' o 'admin' pueden actualizar businesses
CREATE POLICY "Owners and admins can update businesses"
ON businesses FOR UPDATE
USING (
  id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
);

-- Businesses: Solo users con rol 'owner' pueden eliminar businesses
CREATE POLICY "Owners can delete businesses"
ON businesses FOR DELETE
USING (
  id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role = 'owner'
  )
);

-- Business Users: Users pueden ver membresías de businesses de los que forman parte
CREATE POLICY "Users can view business user memberships"
ON business_users FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid()
  )
);

-- Business Users: Owners y admins pueden agregar users a sus businesses
CREATE POLICY "Owners and admins can add users to businesses"
ON business_users FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
);

-- Business Users: Owners y admins pueden actualizar roles de users
CREATE POLICY "Owners and admins can update user roles"
ON business_users FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  business_id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
);

-- Business Users: Owners y admins pueden eliminar users de businesses
-- Owners no pueden eliminarse a sí mismos (aplicado a nivel de aplicación o mediante trigger)
CREATE POLICY "Owners and admins can remove users from businesses"
ON business_users FOR DELETE
USING (
  business_id IN (
    SELECT business_id FROM business_users 
    WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
  )
);

-- Pipelines: Users pueden ver pipelines de businesses accesibles
CREATE POLICY "Users can view pipelines from accessible businesses"
ON pipelines FOR SELECT
USING (business_id = ANY(get_accessible_business_ids()));

-- Pipelines: Users pueden crear pipelines en businesses accesibles
CREATE POLICY "Users can create pipelines in accessible businesses"
ON pipelines FOR INSERT
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Pipelines: Users pueden actualizar pipelines en businesses accesibles
CREATE POLICY "Users can update pipelines in accessible businesses"
ON pipelines FOR UPDATE
USING (business_id = ANY(get_accessible_business_ids()))
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Pipelines: Users pueden eliminar pipelines en businesses accesibles
CREATE POLICY "Users can delete pipelines in accessible businesses"
ON pipelines FOR DELETE
USING (business_id = ANY(get_accessible_business_ids()));

-- Product Categories: Users pueden ver categorías de businesses accesibles
CREATE POLICY "Users can view product categories from accessible businesses"
ON product_categories FOR SELECT
USING (business_id = ANY(get_accessible_business_ids()));

-- Product Categories: Users pueden crear categorías en businesses accesibles
CREATE POLICY "Users can create product categories in accessible businesses"
ON product_categories FOR INSERT
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Product Categories: Users pueden actualizar categorías en businesses accesibles
CREATE POLICY "Users can update product categories in accessible businesses"
ON product_categories FOR UPDATE
USING (business_id = ANY(get_accessible_business_ids()))
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Product Categories: Users pueden eliminar categorías en businesses accesibles
CREATE POLICY "Users can delete product categories in accessible businesses"
ON product_categories FOR DELETE
USING (business_id = ANY(get_accessible_business_ids()));

-- Products: Users pueden ver products de businesses accesibles
CREATE POLICY "Users can view products from accessible businesses"
ON products FOR SELECT
USING (business_id = ANY(get_accessible_business_ids()));

-- Products: Users pueden crear products en businesses accesibles
CREATE POLICY "Users can create products in accessible businesses"
ON products FOR INSERT
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Products: Users pueden actualizar products en businesses accesibles
CREATE POLICY "Users can update products in accessible businesses"
ON products FOR UPDATE
USING (business_id = ANY(get_accessible_business_ids()))
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Products: Users pueden eliminar products en businesses accesibles
CREATE POLICY "Users can delete products in accessible businesses"
ON products FOR DELETE
USING (business_id = ANY(get_accessible_business_ids()));

-- Sales: Users pueden ver sales de businesses accesibles
CREATE POLICY "Users can view sales from accessible businesses"
ON sales FOR SELECT
USING (business_id = ANY(get_accessible_business_ids()));

-- Sales: Users pueden crear sales en businesses accesibles
CREATE POLICY "Users can create sales in accessible businesses"
ON sales FOR INSERT
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Sales: Users pueden actualizar sales en businesses accesibles
CREATE POLICY "Users can update sales in accessible businesses"
ON sales FOR UPDATE
USING (business_id = ANY(get_accessible_business_ids()))
WITH CHECK (business_id = ANY(get_accessible_business_ids()));

-- Sales: Users pueden eliminar sales en businesses accesibles
CREATE POLICY "Users can delete sales in accessible businesses"
ON sales FOR DELETE
USING (business_id = ANY(get_accessible_business_ids()));

-- Pipeline Stages: Users pueden ver stages de pipelines accesibles
CREATE POLICY "Users can view pipeline stages from accessible pipelines"
ON pipeline_stages FOR SELECT
USING (
  pipeline_id IN (
    SELECT id FROM pipelines 
    WHERE business_id = ANY(get_accessible_business_ids())
  )
);

-- Pipeline Stage Leads: Users pueden ver leads de pipelines accesibles
CREATE POLICY "Users can view leads from accessible pipelines"
ON pipeline_stage_leads FOR SELECT
USING (
  pipeline_stage_id IN (
    SELECT id FROM pipeline_stages 
    WHERE pipeline_id IN (
      SELECT id FROM pipelines 
      WHERE business_id = ANY(get_accessible_business_ids())
    )
  )
);

-- Product Snapshots: Users pueden ver snapshots de sales accesibles
CREATE POLICY "Users can view product snapshots from accessible sales"
ON product_snapshots FOR SELECT
USING (
  sale_id IN (
    SELECT id FROM sales 
    WHERE business_id = ANY(get_accessible_business_ids())
  )
);
```

### Paso 9: Crear Funciones Helper para la Aplicación

Todas las funciones helper se basan en la tabla `business_users`:

```sql
-- Función para obtener businesses accesibles por el user actual
-- Devuelve businesses donde el user tiene un registro en business_users
CREATE OR REPLACE FUNCTION get_accessible_businesses()
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  user_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.owner_id,
    b.name,
    b.description,
    b.is_active,
    bu.role as user_role
  FROM businesses b
  INNER JOIN business_users bu ON bu.business_id = b.id
  WHERE bu.user_id = auth.uid()
    AND b.is_active = true;
END;
$$;

-- Función para verificar si el user tiene acceso a un business
-- Basada completamente en la tabla business_users
CREATE OR REPLACE FUNCTION user_has_business_access(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM business_users bu
    INNER JOIN businesses b ON b.id = bu.business_id
    WHERE bu.business_id = p_business_id
      AND bu.user_id = auth.uid()
      AND b.is_active = true
  );
END;
$$;

-- Función para obtener el rol del user en un business
-- Basada completamente en la tabla business_users
CREATE OR REPLACE FUNCTION get_user_business_role(p_business_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT bu.role INTO v_role
  FROM business_users bu
  WHERE bu.business_id = p_business_id
    AND bu.user_id = auth.uid();
  
  RETURN v_role;
END;
$$;
```

### Paso 10: Actualizar Triggers para updated_at

```sql
-- Crear función para actualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Agregar triggers para updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_users_updated_at
  BEFORE UPDATE ON business_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Pasos de Verificación

1. **Verificar Migración de Datos:**
```sql
-- Verificar que todos los pipelines tienen business_id
SELECT COUNT(*) as total, COUNT(business_id) as with_business_id
FROM pipelines;

-- Verificar que todos los products tienen business_id
SELECT COUNT(*) as total, COUNT(business_id) as with_business_id
FROM products;

-- Verificar que todos los sales tienen business_id
SELECT COUNT(*) as total, COUNT(business_id) as with_business_id
FROM sales;
```

2. **Probar Políticas RLS:**
```sql
-- Como user de prueba, verificar que solo puedes ver tus businesses
SELECT * FROM businesses;
SELECT * FROM business_users;
SELECT * FROM products;
SELECT * FROM get_accessible_businesses();
```

3. **Probar Restricciones Únicas:**
```sql
-- Intentar crear SKU duplicado en el mismo business (debe fallar)
-- Intentar crear SKU duplicado en diferente business (debe tener éxito)
```

## Checklist Post-Migración

- [ ] Todos los datos existentes han sido migrados a businesses
- [ ] Todas las columnas business_id son NOT NULL
- [ ] Todas las restricciones de foreign key están en su lugar
- [ ] Todas las restricciones únicas están funcionando correctamente
- [ ] Las políticas RLS están habilitadas y probadas
- [ ] Las views están actualizadas y funcionando
- [ ] Las funciones están actualizadas con parámetro business_id
- [ ] El trigger para agregar automáticamente owner a business_users está funcionando
- [ ] El código de la aplicación está actualizado para incluir business_id en queries
- [ ] El código de la aplicación está actualizado para filtrar por business_id
- [ ] La UI de gestión de businesses está implementada
- [ ] La UI de gestión de business users está implementada
- [ ] La UI de selección/cambio de business está implementada

## Actualizaciones de Código de Aplicación Necesarias

1. **Actualizar todas las queries** para incluir filtro `business_id`
2. **Agregar contexto de business** al estado de tu aplicación
3. **Actualizar formularios** para incluir selección de business
4. **Actualizar llamadas API** para pasar `business_id`
5. **Implementar UI de gestión de businesses** (crear, editar, eliminar businesses)
6. **Implementar UI de gestión de business users** (agregar/eliminar users, asignar roles)
7. **Implementar UI de cambio de business** (permitir a users cambiar entre sus businesses)
8. **Actualizar flujo de autenticación** para manejar creación de business en primer login (opcional)

## Notas

### Puntos Clave de Arquitectura

- **`business_users` es la tabla de extensión central** que extiende `auth.users` y define todas las relaciones user-business
- **Todo el control de acceso se basa en `business_users`** - esta es la única fuente de verdad
- Cuando un user crea un business, se agrega **automáticamente a `business_users`** con rol 'owner' mediante trigger
- Los users solo pueden ver y acceder a datos de businesses donde tienen un registro en `business_users`
- El campo `owner_id` en `businesses` se mantiene como referencia, pero la autorización proviene de `business_users`

### Aislamiento de Datos

- El `order_number` en sales ahora es único por business, no globalmente
- La unicidad de SKU ahora es por business, permitiendo el mismo SKU entre businesses
- Las categorías de products pueden tener el mismo nombre en diferentes businesses
- Todas las queries deben filtrar por `business_id` para un aislamiento adecuado de datos
- Todas las políticas RLS se basan en la tabla `business_users`

### Gestión de Users

- Los users pueden poseer múltiples businesses y ser miembros de múltiples businesses
- Los users pueden invitar a otros users a sus businesses mediante la tabla `business_users`
- Jerarquía de roles: 'owner' > 'admin' > 'manager' > 'employee'
- Considera almacenar `current_business_id` en sesión/contexto del user para estado de UI
- Al agregar users a un business, siempre crear un registro en `business_users` con el rol apropiado
