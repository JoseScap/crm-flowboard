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
- Migrar el nombre a "Conectores" como lo tiene ChatGPT. ❓
- Poder configurar la Aplicación de WhatsApp personal para recibir mensajes críticos del CRM. ❓
    - Mensajes críticos: Fuera de stock por ejemplo. ❓

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
- Opción de visualización de contraseña con temporizador de seguridad ✅
- Enlace directo a la recuperación de contraseña ✅
- Botón de inicio de sesión rápido con Google ✅

### Login Google Callback

- Manejo automático del callback de autenticación tras el inicio de sesión con Google ✅
- Detección de cambios en el estado de autenticación en tiempo real ✅
- Gestión de errores provenientes del proveedor OAuth ✅
- Notificaciones visuales sobre el estado del proceso ✅
- Sistema de seguridad con tiempo de espera (timeout) para evitar bloqueos ✅
- Redirección inteligente basada en el resultado de la autenticación ✅

### Password Recovery Request

- Formulario para solicitar el restablecimiento de contraseña vía correo electrónico ✅
- Integración con Supabase para el envío de enlaces seguros ✅
- Validación de campos obligatorios ✅
- Notificaciones de éxito y error claras para el usuario ✅
- Navegación fluida para volver al inicio de sesión ✅

### Register

- Formulario de creación de cuenta con validación de correo y contraseña ✅
- Sistema de verificación de coincidencia de contraseñas ✅
- Validación de longitud mínima de seguridad para la contraseña ✅
- Creación de usuarios en Supabase Auth ✅
- Gestión de estados de carga durante el proceso de registro ✅
- Opción para alternar la visibilidad de las contraseñas ✅
- Redirección al login tras un registro exitoso para validación de correo ✅

### Update Password

- Formulario dedicado para establecer una nueva contraseña de acceso ✅
- Validación rigurosa de longitud y coincidencia de contraseñas ✅
- Actualización segura del perfil de usuario en Supabase ✅
- Control de visibilidad para mayor comodidad del usuario ✅
- Redirección automática al inicio de sesión tras completar la actualización ✅
- Interfaz intuitiva con acceso rápido para volver atrás ✅

## Businesses

Este módulo permite la administración centralizada de las empresas o negocios registrados en la plataforma, gestionando tanto su configuración básica como el personal asociado.

### Businesses Home

- Listado de todos los negocios a los que el usuario tiene acceso ✅
- Creación de nuevos negocios con registro automático del dueño como primer empleado ✅
- Edición de la información de perfil del negocio (nombre, contacto, ubicación) ✅
- Interfaz de cuadrícula con acceso directo al panel de control de cada empresa ✅
- Visualización de métricas rápidas (leads activos y pipelines) por negocio ✅
- Interfaz de tarjeta mejorada con indicadores visuales coloreados y mayor legibilidad ✅

### Business View

- Panel de control integral con métricas en tiempo real (ingresos, ventas, inventario) ✅
- Gestión de la nómina de empleados del negocio ✅
- Sistema de invitación para añadir nuevos miembros al equipo de trabajo ✅
- Control de estado (activación/desactivación) de empleados mediante lógica de servidor ✅
- Visualización detallada de la salud financiera y operativa del negocio ✅
- Agregar un danger zone para: ✅
    - Poder desactivar un negocio, solo el owner va a poder visualizarlo y reactivarlo. ✅
- Activar o desactivar opción de "Transparencias De Ventas" en la DangerZone. (Pendiente)
- Poder logo específico a un bussiness. (Pendiente)

### Quick Actions (Funcionalidad Adicional Pendiente)
- Pasan a ser dinámicas y no estáticas. 
- Se pueden agregar quick actions específicas
- Ranking de uso de quick actions
- Solamente para el dueño 

### Reportes (Funcionalidad Adicional Pendiente)
- Migrar todos los reportes solamente para que lo pueda ver el dueño, y a quien permita el dueño.
- (FEATURE ADICCIONAL) El dueño pueda crear sus propios reporpotes o reportes personalizados. 
    Robar mercado a negocios con Analíticas. --> Muy a futuro. 

## Leads

Este módulo se centra en la gestión profunda de prospectos y oportunidades de venta, integrando herramientas de comunicación y gestión de inventario para facilitar el cierre de negocios.

### Lead Details

- Visualización detallada del perfil del cliente y su posición en el embudo de ventas ✅
- Integración bidireccional con WhatsApp para comunicación directa desde el CRM ✅
- Gestión de ítems de preventa asociados al lead con actualización de valor en tiempo real ✅
- Capacidad de asignar y reasignar prospectos entre los miembros del equipo ✅
- Flujo de conversión directa de prospecto a venta (proceso de cierre) ✅
- Historial de interacciones y mensajería persistente ✅
- Back to pipeline boleatear por que el breadcrumb esta en el layout.
- Replantear UI del Lead Details con 2 Tabs, la tab por default es el chat y la otra tab es la venta, y otra tab la información del propio lead para optimizar el espacio.
- Cancelar venta / Cancelar Lead para cerrar un lead sin venta.
- Botón para agregar un item de venta manual, agregar detalles a la venta y no necesariamenmte maneja productos.

## Pipelines

Este módulo es el núcleo operativo del CRM, permitiendo la visualización y gestión del flujo de ventas a través de embudos personalizados y herramientas de automatización.

### Pipelines Home

- Gestión de múltiples embudos de venta por cada unidad de negocio ✅
- Creación simplificada de pipelines con nombres y descripciones personalizadas ✅
- Acceso rápido a la vista detallada y configuración de cada tablero ✅
- Info adicioanl, mostrando leads abiertos.
- Created_at se boletea del pipelien.
- Pipeline configuration x2 (está repetido) al editar -- Borrarlo, error de cursor.
- Que ocupe todo el ancho de la página, si no queda raro.
- Generación de una key para la seguridad bidireccional; configuración adicional para la seguridad de  Kapso.
- Ver si se puede integrar todo configurable via API Kapso. 

### Pipeline View

- Interfaz Kanban interactiva para la gestión visual de oportunidades de venta ✅
- Soporte completo para arrastrar y soltar (Drag & Drop) en el movimiento de prospectos ✅
- Administración de etapas: personalización de nombres, colores y orden posicional ✅
- Sincronización en tiempo real con otros usuarios mediante Supabase Realtime ✅
- Métricas clave integradas: valor total del embudo, ingresos cerrados y tasa de conversión ✅
- Filtrado dinámico de leads por responsable asignado ✅
- Definición de "Etapa de Ingresos" para el seguimiento automático de cierres exitosos ✅
- Estadísticas no se muestran a los salesperson.
- Boton adicional de estadísticas de Pipeline. (Owner | Admins)
- All Assigness -> Utilizar el select de la librería y no el nativo. Utilizar la imagen de perfil,
- Ventas por WA, no existe si no tenes que volver por el breadcrumb a otro pipeline si es que necesitas cambiar.
- Modal de creación de nuevo stagenuevo debe permitir crear que sea de tipo input. (Buscarle un nombre más representativo)
- Si es un modal de tipo input, hay que indicar quien se le asigna por default, solo si es de tipo input.
- Barrita para mover leads; debería tener el color del CRM. (Scroll Lateral)
- Al reordenar los leads hace falta un loader.
- Al cambiar de columnas hace falta mejorar el cambio de columna.
- Assigned to : Cambie a la foto de la persona que lo tiene asignado. 
- (?) Futuro: Buscar mostrar por donde es el contacto (Wpp | Facebook, etc)
- El modal de archivar va dentro del lead, no en el pipeline.
- El N/A del correo no aporta, y se rompe la UI.
- Al tocar un lead; debe abrir los datos del lead, no hay necesidads de tocar el ojito.



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
- (Feature Futura) - Gestión de Estados // Definir la cantidad. (Danger Stock & Warning Stock)

## Sales

Este módulo gestiona el registro histórico y la creación de nuevas transacciones comerciales, asegurando la integridad de los datos de venta y el inventario.

### Sales Home

- Historial completo de transacciones con visualización detallada de pedidos ✅
- Consulta de snapshots de productos (nombre, SKU y precio al momento de la venta) ✅
- Rastreo de vendedores asociados a cada operación comercial ✅
- Sistema de búsqueda por número de orden y filtrado por montos o fechas ✅
- Gestión de estados de venta (completada, abierta, cancelada) ✅
- Order no aportada nada; la fecha tampoco. (Persona (fotito) | Fecha)
- Tabla de la siguiente forma: 
    | Id | Persona (fotito) - Date | Total Venta
        Desplegable donde se pueda mostrar los productos de la venta. 
    Background para las canceladas, y si no es cancelada entonces el bg normal.
    Active lo volaría también 
- Agregar el listado del producto porque esta roto 
- Owner debería poder modificar la venta si hace falta.

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

## User Profile

### Profile Page
- La persona debe poder modificar su propia foto y esta se debe poder utilizar en toda la página.
- La persona puede modificar el perfil.
- La persona puede ver sus ventas y que sea una opción configurable en el bussiness (%); opción configurable por el owner.



## Alerts
aplicaciones

conectas telegram, queda la conexion

notificaciones por usuario

activar notificaciones

- warn stock synergia (mail)
- danger stock synergia (mail)
- out of stock synergia (mail)

## Otros

- Página principal, hace falta >> Landing Page Aparte. (Pendiente)
- No me gusta el color (blanco) del login > Color del autocompletado. (Pendiente)
- Botoncito para cerrar en el medio del aside donde no moleste. (Pendiente)
