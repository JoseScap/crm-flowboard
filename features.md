# Features

Este archivo sirve como una guía técnica y funcional del sistema CRM Flowboard. Su propósito es documentar las capacidades actuales de la plataforma, detallando los módulos disponibles, sus casos de uso específicos y la lógica de negocio implementada para facilitar el desarrollo y mantenimiento del proyecto.

## Applications

Este módulo gestiona la integración de servicios de terceros mediante flujos de autenticación OAuth, permitiendo que el CRM se conecte con herramientas externas para extender sus capacidades.

### Applications Home

- Listado de integraciones externas disponibles (actualmente enfocado en Google Calendar) ✅
- Detección en tiempo real del estado de conexión para cada aplicación ✅
- Inicio del flujo de autorización OAuth mediante redirección externa ✅
- Capacidad para revocar el acceso y eliminar conexiones de forma segura ✅
- Soporte para contextos multi-negocio, aislando las conexiones por empresa ✅

### Google OAuth Callback

- Manejo integral de la respuesta de Google (captura de `code`, `state` y `error`) ✅
- Intercambio seguro de código de autorización por tokens de acceso y actualización ✅
- Resolución automática del contexto del empleado y el negocio actual ✅
- Persistencia de credenciales (`access_token`, `refresh_token`) y metadatos del proveedor ✅
- Gestión de expiración de tokens para asegurar la disponibilidad del servicio ✅

## Auth

Este módulo se encarga de gestionar el acceso de los usuarios a la plataforma, asegurando que solo el personal autorizado de los negocios pueda interactuar con el sistema CRM.

### Login

- Formulario de autenticación con correo y contraseña ✅
- Integración con Supabase Auth para validación de credenciales ✅
- Redirección automática al dashboard principal tras un acceso exitoso ✅
- Gestión de estados de carga y errores mediante notificaciones visuales ✅

## Businesses

Este módulo permite la administración centralizada de las empresas o negocios registrados en la plataforma, gestionando tanto su configuración básica como el personal asociado.

### Businesses Home

- Listado de todos los negocios a los que el usuario tiene acceso ✅
- Creación de nuevos negocios con registro automático del dueño como primer empleado ✅
- Edición de la información de perfil del negocio (nombre, contacto, ubicación) ✅
- Interfaz de cuadrícula con acceso directo al panel de control de cada empresa ✅

### Business View

- Panel de control integral con métricas en tiempo real (ingresos, ventas, inventario) ✅
- Gestión de la nómina de empleados del negocio ✅
- Sistema de invitación para añadir nuevos miembros al equipo de trabajo ✅
- Control de estado (activación/desactivación) de empleados mediante lógica de servidor ✅
- Visualización detallada de la salud financiera y operativa del negocio ✅

## Leads

Este módulo se centra en la gestión profunda de prospectos y oportunidades de venta, integrando herramientas de comunicación y gestión de inventario para facilitar el cierre de negocios.

### Lead Details

- Visualización detallada del perfil del cliente y su posición en el embudo de ventas ✅
- Integración bidireccional con WhatsApp para comunicación directa desde el CRM ✅
- Gestión de ítems de preventa asociados al lead con actualización de valor en tiempo real ✅
- Capacidad de asignar y reasignar prospectos entre los miembros del equipo ✅
- Flujo de conversión directa de prospecto a venta (proceso de cierre) ✅
- Historial de interacciones y mensajería persistente ✅

## Pipelines

Este módulo es el núcleo operativo del CRM, permitiendo la visualización y gestión del flujo de ventas a través de embudos personalizados y herramientas de automatización.

### Pipelines Home

- Gestión de múltiples embudos de venta por cada unidad de negocio ✅
- Creación simplificada de pipelines con nombres y descripciones personalizadas ✅
- Acceso rápido a la vista detallada y configuración de cada tablero ✅

### Pipeline View

- Interfaz Kanban interactiva para la gestión visual de oportunidades de venta ✅
- Soporte completo para arrastrar y soltar (Drag & Drop) en el movimiento de prospectos ✅
- Administración de etapas: personalización de nombres, colores y orden posicional ✅
- Sincronización en tiempo real con otros usuarios mediante Supabase Realtime ✅
- Métricas clave integradas: valor total del embudo, ingresos cerrados y tasa de conversión ✅
- Filtrado dinámico de leads por responsable asignado ✅
- Definición de "Etapa de Ingresos" para el seguimiento automático de cierres exitosos ✅

### Pipelines Config

- Panel de configuración específica para integraciones avanzadas ✅
- Vinculación y gestión de cuentas de WhatsApp Business Cloud API ✅
- Validación y persistencia de identificadores de telefonía para mensajería automatizada ✅

## Products

Este módulo permite la gestión integral del catálogo de productos y servicios, asegurando un control preciso del inventario y su categorización.

### Products Home

- Gestión completa del ciclo de vida de productos (CRUD y activación/desactivación) ✅
- Sistema de categorización jerárquica para organizar el inventario ✅
- Monitorización inteligente de stock con alertas visuales de niveles bajos o agotados ✅
- Motor de búsqueda por texto libre (nombre) y códigos SKU ✅
- Sincronización automática de existencias ante cambios en la base de datos ✅
- Configuración de umbrales de stock mínimo para la prevención de quiebres de inventario ✅

## Sales

Este módulo gestiona el registro histórico y la creación de nuevas transacciones comerciales, asegurando la integridad de los datos de venta y el inventario.

### Sales Home

- Historial completo de transacciones con visualización detallada de pedidos ✅
- Consulta de snapshots de productos (nombre, SKU y precio al momento de la venta) ✅
- Rastreo de vendedores asociados a cada operación comercial ✅
- Sistema de búsqueda por número de orden y filtrado por montos o fechas ✅
- Gestión de estados de venta (completada, abierta, cancelada) ✅

### New Sale

- Punto de venta (POS) simplificado para la generación de nuevas órdenes ✅
- Selector dinámico de productos con validación automática de existencias ✅
- Motor de cálculo de impuestos (IVA/Tax) y totales parametrizable ✅
- Procesamiento atómico de ventas: creación de orden, snapshots y actualización de stock ✅
- Flujo de navegación integrado para un retorno rápido al historial tras la venta ✅

## Types

Módulo técnico que centraliza la definición de estructuras de datos y esquemas para todo el proyecto.

- Definición de tipos TypeScript basados en el esquema de base de datos de Supabase ✅
- Tipado estricto para las respuestas de la API y estados globales ✅
