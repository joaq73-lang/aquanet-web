# AQUANET - Sistema de Gestión de Servicios de Agua

Sistema web para la gestión de clientes, suministros, facturación, pagos e incidencias de servicios de agua potable.

## Características

- **Autenticación**: Login y registro de clientes (personas naturales y empresas)
- **Gestión de Clientes**: Perfil, dirección e información de contacto
- **Suministros**: Listado de suministros activos del cliente
- **Facturación**: Historial de facturas con desglose de conceptos
- **Pagos**: Proceso de pago de facturas con múltiples canales
- **Reclamos**: Registro y seguimiento de reclamos
- **Incidencias**: Consulta de incidencias activas en la zona
- **Consultas**: Envío de consultas al servicio de atención al cliente

## Stack Tecnológico

### Frontend
- React 19
- TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI (componentes)
- Lucide React (iconos)

### Backend
- Nitro (serverless framework)
- Node.js
- PostgreSQL
- JWT (autenticación)
- bcrypt (hash de contraseñas)

## Requisitos Previos

- Node.js 18+
- PostgreSQL 15+ (o base de datos en la nube como Supabase/Neon)
- npm o pnpm

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/aquanet-web.git
cd aquanet-web
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=tu-host
DB_PORT=5432
DB_NAME=aquanet_db
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
JWT_SECRET=tu-secreto-jwt
```

4. Crear la base de datos y ejecutar el schema:
```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE aquanet_db;"
psql -U postgres -h localhost -p 5432 -d aquanet_db -f db/schema.sql
```

Si usas una base de datos en la nube (Supabase/Neon):
- Crea el proyecto en la plataforma
- Copia la cadena de conexión
- Actualiza el archivo `.env` con tus credenciales
- Ejecuta el contenido de `db/schema.sql` en el SQL Editor de la plataforma

## Ejecución

Modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

Build para producción:
```bash
npm run build
npm run preview
```

## Estructura del Proyecto

```
aquanet-web/
├── db/
│   └── schema.sql           # Schema de base de datos PostgreSQL
├── src/
│   ├── components/          # Componentes React reutilizables
│   ├── routes/             # Rutas de la aplicación (TanStack Router)
│   │   ├── index.tsx       # Página principal (login/registro)
│   │   ├── realizar-pago.tsx
│   │   ├── historial.tsx
│   │   └── incidencias.tsx
│   └── server/
│       ├── auth.ts         # Módulo de autenticación
│       ├── db.ts           # Conexión a PostgreSQL
│       └── api/            # Endpoints de la API
│           ├── auth/        # Login, registro, me
│           ├── clientes/    # Perfil, dirección
│           ├── suministros/ # Lista de suministros
│           ├── facturas/    # Lista de facturas
│           ├── pagos/       # Registrar pago
│           ├── canales/     # Canales de pago
│           ├── medios-pago/ # Medios de pago
│           ├── reclamos/    # Registrar, listar reclamos
│           ├── consultas/   # Registrar consulta
│           └── incidencias/  # Listar incidencias
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por Git
└── package.json            # Dependencias y scripts
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo cliente
- `GET /api/auth/me` - Obtener usuario autenticado

### Clientes
- `GET /api/clientes/perfil` - Obtener perfil del cliente
- `GET /api/clientes/direccion` - Obtener dirección del cliente

### Suministros
- `GET /api/suministros/list` - Listar suministros del cliente

### Facturas
- `GET /api/facturas/list` - Listar facturas (opcionalmente filtrar por estado)

### Pagos
- `POST /api/pagos/registrar` - Registrar un pago

### Canales de Pago
- `GET /api/canales/list` - Listar canales de pago disponibles

### Medios de Pago
- `GET /api/medios-pago/list` - Listar medios de pago

### Reclamos
- `POST /api/reclamos/registrar` - Registrar un reclamo
- `GET /api/reclamos/list` - Listar reclamos del cliente

### Consultas
- `POST /api/consultas/registrar` - Registrar una consulta

### Incidencias
- `GET /api/incidencias/list` - Listar incidencias activas (filtrar por ubigeo)

## Base de Datos

El schema de la base de datos está normalizado hasta 3NF e incluye:

- **CLIENTE** (base para herencia)
  - CLIENTE_INDIVIDUAL (personas naturales)
  - CLIENTE_EMPRESA (empresas)
- **DIRECCION**
- **SUMINISTRO**
- **FACTURA**
- **PAGO**
- **CANAL_PAGO**
- **MEDIO_PAGO**
- **CONSULTA**
- **RECLAMO**
- **INCIDENCIA** (con tablas intermedias INCIDENCIA_SUMINISTRO e INCIDENCIA_CLIENTE)
- **USUARIO_SISTEMA**

## Licencia

MIT

## Autor

AQUANET - Sistema de Gestión de Servicios de Agua
