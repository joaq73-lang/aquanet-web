-- ============================================================================
-- AQUANET - PostgreSQL Schema
-- Sistema de Gestión de Clientes, Suministros, Facturas y Pagos
-- ============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS para estados categóricos
-- ============================================================================
CREATE TYPE estado_cliente AS ENUM ('activo', 'inactivo', 'suspendido', 'bloqueado');
CREATE TYPE tipo_cliente_disc AS ENUM ('individual', 'empresa');
CREATE TYPE tipo_documento AS ENUM ('DNI', 'CE', 'RUC', 'PASAPORTE');
CREATE TYPE tipo_suministro AS ENUM ('domiciliario', 'industrial', 'comercial', 'institucional');
CREATE TYPE estado_suministro AS ENUM ('activo', 'inactivo', 'cortado', 'suspendido');
CREATE TYPE estado_factura AS ENUM ('emitida', 'cancelada', 'parcial', 'vencida', 'anulada');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'procesado', 'confirmado', 'rechazado', 'reembolsado');
CREATE TYPE tipo_via AS ENUM ('AV', 'CA', 'JR', 'PJ', 'PS', 'CDA', 'ASOC', 'PTE', 'ZN', 'URB', 'COOP', 'VÍA');
CREATE TYPE tipo_interior AS ENUM ('AP', 'LOTE', 'DPTO', 'MZNA', 'LT', 'PH', 'SN');
CREATE TYPE modalidad_canal AS ENUM ('presencial', 'virtual', 'telefonica', 'automatica');
CREATE TYPE tipo_canal AS ENUM ('agencia_sedapal', 'banco', 'cajero_automatico', 'portal_web', 'app_movil', 'telefonica');
CREATE TYPE nombre_medio_pago AS ENUM ('tarjeta_credito', 'tarjeta_debito', 'efectivo', 'transferencia_bancaria', 'billetera_digital', 'cheque');
CREATE TYPE estado_consulta AS ENUM ('registrada', 'asignada', 'en_proceso', 'respondida', 'cerrada');
CREATE TYPE tipo_reclamo AS ENUM ('medidor_dañado', 'factura_error', 'servicio_deficiente', 'calidad_agua', 'otro');
CREATE TYPE estado_reclamo AS ENUM ('registrado', 'asignado', 'en_investigacion', 'resuelto', 'cerrado', 'denegado');
CREATE TYPE tipo_incidencia AS ENUM ('corte_emergencia', 'fuga', 'rotura_tuberia', 'mantenimiento', 'problema_calidad', 'bajo_presion', 'corte_programado');
CREATE TYPE estado_incidencia AS ENUM ('reportada', 'asignada', 'en_proceso', 'resuelta', 'cerrada');

-- ============================================================================
-- TABLA: CLIENTE (base para herencia)
-- ============================================================================
CREATE TABLE cliente (
  codigo_cliente SERIAL PRIMARY KEY,
  tipo_cliente tipo_cliente_disc NOT NULL,
  fecha_registro_cliente TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  telefono VARCHAR(20),
  correo VARCHAR(120),
  total_suministros INTEGER DEFAULT 0,
  saldo_deuda_por_pagar DECIMAL(15, 2) DEFAULT 0.00,
  saldo_deudas_pagadas DECIMAL(15, 2) DEFAULT 0.00,
  total_facturas_pagadas INTEGER DEFAULT 0,
  total_factura_por_pagar DECIMAL(15, 2) DEFAULT 0.00,
  estado_cliente estado_cliente DEFAULT 'activo',
  CONSTRAINT ck_correo_format CHECK (correo ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' OR correo IS NULL)
);

CREATE INDEX idx_cliente_correo ON cliente(correo);
CREATE INDEX idx_cliente_estado ON cliente(estado_cliente);

-- ============================================================================
-- TABLA: CLIENTE_INDIVIDUAL (especialización)
-- ============================================================================
CREATE TABLE cliente_individual (
  codigo_cliente INTEGER PRIMARY KEY,
  tipo_documento tipo_documento NOT NULL,
  nro_documento VARCHAR(15) UNIQUE NOT NULL,
  nombres VARCHAR(60) NOT NULL,
  apellido_paterno VARCHAR(40) NOT NULL,
  apellido_materno VARCHAR(40),
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cliente_individual_documento ON cliente_individual(nro_documento);

-- ============================================================================
-- TABLA: CLIENTE_EMPRESA (especialización)
-- ============================================================================
CREATE TABLE cliente_empresa (
  codigo_cliente INTEGER PRIMARY KEY,
  ruc VARCHAR(11) UNIQUE NOT NULL,
  razon_social VARCHAR(120) NOT NULL,
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cliente_empresa_ruc ON cliente_empresa(ruc);

-- ============================================================================
-- TABLA: DIRECCION
-- ============================================================================
CREATE TABLE direccion (
  codigo_direccion SERIAL PRIMARY KEY,
  codigo_cliente INTEGER NOT NULL UNIQUE,
  ubigeo VARCHAR(6),
  tipo_via tipo_via NOT NULL,
  nombre_via VARCHAR(80) NOT NULL,
  nro_via VARCHAR(10) NOT NULL,
  urbanizacion VARCHAR(80),
  manzana VARCHAR(5),
  nro_lote VARCHAR(5),
  tipo_interior tipo_interior,
  nro_interior VARCHAR(10),
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_direccion_cliente ON direccion(codigo_cliente);
CREATE INDEX idx_direccion_ubigeo ON direccion(ubigeo);

-- ============================================================================
-- TABLA: SUMINISTRO
-- ============================================================================
CREATE TABLE suministro (
  codigo_suministro SERIAL PRIMARY KEY,
  codigo_cliente INTEGER NOT NULL,
  codigo_direccion INTEGER NOT NULL,
  tipo_suministro tipo_suministro DEFAULT 'domiciliario',
  fecha_alta DATE NOT NULL,
  fecha_baja DATE,
  consumo_total_agua DECIMAL(10, 2) DEFAULT 0.00,
  total_beneficiarios INTEGER DEFAULT 1,
  total_facturas_generadas INTEGER DEFAULT 0,
  estado_suministro estado_suministro DEFAULT 'activo',
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (codigo_direccion) REFERENCES direccion(codigo_direccion) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_fecha_baja CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_alta)
);

CREATE INDEX idx_suministro_cliente ON suministro(codigo_cliente);
CREATE INDEX idx_suministro_direccion ON suministro(codigo_direccion);
CREATE INDEX idx_suministro_estado ON suministro(estado_suministro);

-- ============================================================================
-- TABLA: CANAL_PAGO
-- ============================================================================
CREATE TABLE canal_pago (
  codigo_canal SERIAL PRIMARY KEY,
  modalidad_canal modalidad_canal NOT NULL,
  tipo_canal tipo_canal NOT NULL,
  nombre_canal VARCHAR(100) NOT NULL,
  dias_disponibles VARCHAR(50),
  hora_inicio_abierto TIME,
  hora_fin_abierto TIME,
  estado_canal BOOLEAN DEFAULT TRUE,
  direccion VARCHAR(150),
  ubigeo VARCHAR(6),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8)
);

CREATE INDEX idx_canal_pago_tipo ON canal_pago(tipo_canal);
CREATE INDEX idx_canal_pago_ubigeo ON canal_pago(ubigeo);

-- ============================================================================
-- TABLA: MEDIO_PAGO
-- ============================================================================
CREATE TABLE medio_pago (
  codigo_medio_pago SERIAL PRIMARY KEY,
  nombre_medio_pago nombre_medio_pago NOT NULL UNIQUE
);

-- Insertar medios de pago estándar
INSERT INTO medio_pago (nombre_medio_pago) VALUES
  ('tarjeta_credito'),
  ('tarjeta_debito'),
  ('efectivo'),
  ('transferencia_bancaria'),
  ('billetera_digital'),
  ('cheque');

-- ============================================================================
-- TABLA: FACTURA
-- ============================================================================
CREATE TABLE factura (
  codigo_factura SERIAL PRIMARY KEY,
  codigo_suministro INTEGER NOT NULL,
  fecha_inicio_consumo DATE NOT NULL,
  fecha_fin_consumo DATE NOT NULL,
  fecha_emision_factura DATE NOT NULL,
  fecha_vencimiento_factura DATE NOT NULL,
  consumo_agua_factura DECIMAL(10, 2) NOT NULL,
  monto_concepto_consumo DECIMAL(15, 2) DEFAULT 0.00,
  monto_concepto_alcantarillado DECIMAL(15, 2) DEFAULT 0.00,
  monto_concepto_cargo_fijo DECIMAL(15, 2) DEFAULT 0.00,
  monto_concepto_igv DECIMAL(15, 2) DEFAULT 0.00,
  monto_concepto_mora DECIMAL(15, 2) DEFAULT 0.00,
  monto_total DECIMAL(15, 2) NOT NULL,
  monto_pagado DECIMAL(15, 2) DEFAULT 0.00,
  estado_factura estado_factura DEFAULT 'emitida',
  FOREIGN KEY (codigo_suministro) REFERENCES suministro(codigo_suministro) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_fecha_fin_mayor CHECK (fecha_fin_consumo >= fecha_inicio_consumo),
  CONSTRAINT ck_monto_pagado CHECK (monto_pagado <= monto_total AND monto_pagado >= 0)
);

CREATE INDEX idx_factura_suministro ON factura(codigo_suministro);
CREATE INDEX idx_factura_estado ON factura(estado_factura);
CREATE INDEX idx_factura_vencimiento ON factura(fecha_vencimiento_factura);

-- ============================================================================
-- TABLA: PAGO
-- ============================================================================
CREATE TABLE pago (
  codigo_pago SERIAL PRIMARY KEY,
  codigo_factura INTEGER NOT NULL,
  codigo_canal INTEGER NOT NULL,
  codigo_medio_pago INTEGER NOT NULL,
  fecha_pago DATE NOT NULL,
  hora_pago TIME,
  monto_pagado DECIMAL(15, 2) NOT NULL,
  estado_pago estado_pago DEFAULT 'pendiente',
  numero_transaccion VARCHAR(50),
  referencia_bancaria VARCHAR(50),
  FOREIGN KEY (codigo_factura) REFERENCES factura(codigo_factura) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (codigo_canal) REFERENCES canal_pago(codigo_canal) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (codigo_medio_pago) REFERENCES medio_pago(codigo_medio_pago) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_monto_pago CHECK (monto_pagado > 0)
);

CREATE INDEX idx_pago_factura ON pago(codigo_factura);
CREATE INDEX idx_pago_canal ON pago(codigo_canal);
CREATE INDEX idx_pago_estado ON pago(estado_pago);
CREATE INDEX idx_pago_fecha ON pago(fecha_pago);

-- ============================================================================
-- TABLA: CONSULTA
-- ============================================================================
CREATE TABLE consulta (
  codigo_consulta SERIAL PRIMARY KEY,
  codigo_cliente INTEGER NOT NULL,
  fecha_registro_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hora_registro_consulta TIME DEFAULT CURRENT_TIME,
  asunto VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha_respuesta_consulta TIMESTAMP,
  hora_respuesta_consulta TIME,
  tiempo_respuesta_horas INTEGER,
  respuesta TEXT,
  estado_consulta estado_consulta DEFAULT 'registrada',
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_consulta_cliente ON consulta(codigo_cliente);
CREATE INDEX idx_consulta_estado ON consulta(estado_consulta);

-- ============================================================================
-- TABLA: RECLAMO
-- ============================================================================
CREATE TABLE reclamo (
  codigo_reclamo SERIAL PRIMARY KEY,
  codigo_cliente INTEGER NOT NULL,
  codigo_suministro INTEGER,
  tipo_reclamo tipo_reclamo NOT NULL,
  fecha_registro_reclamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT,
  fecha_notificacion_solucion_reclamo TIMESTAMP,
  fecha_solucion_reclamo TIMESTAMP,
  estado_reclamo estado_reclamo DEFAULT 'registrado',
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (codigo_suministro) REFERENCES suministro(codigo_suministro) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_reclamo_cliente ON reclamo(codigo_cliente);
CREATE INDEX idx_reclamo_estado ON reclamo(estado_reclamo);

-- ============================================================================
-- TABLA: INCIDENCIA
-- ============================================================================
CREATE TABLE incidencia (
  codigo_incidencia SERIAL PRIMARY KEY,
  tipo_incidencia tipo_incidencia NOT NULL,
  fecha_inicio_incidencia TIMESTAMP NOT NULL,
  fecha_aviso_incidencia TIMESTAMP,
  fecha_fin_incidencia TIMESTAMP,
  tiempo_resolucion_minutos INTEGER,
  total_suministros_afectados INTEGER DEFAULT 0,
  total_clientes_afectados INTEGER DEFAULT 0,
  estado_incidencia estado_incidencia DEFAULT 'reportada',
  descripcion TEXT,
  zona VARCHAR(100),
  ubigeo VARCHAR(6)
);

CREATE INDEX idx_incidencia_estado ON incidencia(estado_incidencia);
CREATE INDEX idx_incidencia_tipo ON incidencia(tipo_incidencia);
CREATE INDEX idx_incidencia_fecha ON incidencia(fecha_inicio_incidencia);
CREATE INDEX idx_incidencia_ubigeo ON incidencia(ubigeo);

-- ============================================================================
-- TABLA INTERMEDIA: INCIDENCIA_SUMINISTRO (N a N)
-- ============================================================================
CREATE TABLE incidencia_suministro (
  codigo_incidencia INTEGER NOT NULL,
  codigo_suministro INTEGER NOT NULL,
  PRIMARY KEY (codigo_incidencia, codigo_suministro),
  FOREIGN KEY (codigo_incidencia) REFERENCES incidencia(codigo_incidencia) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (codigo_suministro) REFERENCES suministro(codigo_suministro) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- TABLA INTERMEDIA: INCIDENCIA_CLIENTE (N a N)
-- ============================================================================
CREATE TABLE incidencia_cliente (
  codigo_incidencia INTEGER NOT NULL,
  codigo_cliente INTEGER NOT NULL,
  PRIMARY KEY (codigo_incidencia, codigo_cliente),
  FOREIGN KEY (codigo_incidencia) REFERENCES incidencia(codigo_incidencia) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- TABLA: USUARIO_SISTEMA (para autenticación)
-- ============================================================================
CREATE TABLE usuario_sistema (
  codigo_usuario SERIAL PRIMARY KEY,
  codigo_cliente INTEGER,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_login TIMESTAMP,
  FOREIGN KEY (codigo_cliente) REFERENCES cliente(codigo_cliente) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT ck_usuario_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_usuario_email ON usuario_sistema(email);
CREATE INDEX idx_usuario_cliente ON usuario_sistema(codigo_cliente);

-- ============================================================================
-- DATOS DE PRUEBA
-- ============================================================================

-- Clientes de prueba
INSERT INTO cliente (tipo_cliente, telefono, correo, estado_cliente) VALUES
  ('individual', '987654321', 'carlos.perez@example.com', 'activo'),
  ('individual', '987654322', 'maria.garcia@example.com', 'activo'),
  ('empresa', '987654323', 'contacto@empresa.com', 'activo');

INSERT INTO cliente_individual (codigo_cliente, tipo_documento, nro_documento, nombres, apellido_paterno, apellido_materno) VALUES
  (1, 'DNI', '12345678', 'Carlos', 'Pérez', 'López'),
  (2, 'DNI', '87654321', 'María', 'García', 'Rodríguez');

INSERT INTO cliente_empresa (codigo_cliente, ruc, razon_social) VALUES
  (3, '20123456789', 'Empresa Comercial S.A.C.');

-- Direcciones de prueba
INSERT INTO direccion (codigo_cliente, ubigeo, tipo_via, nombre_via, nro_via, urbanizacion, manzana, nro_lote, tipo_interior, nro_interior) VALUES
  (1, '150131', 'JR', 'Primavera', '123', 'San Juan de Miraflores', 'A', '5', 'AP', '302'),
  (2, '150131', 'AV', 'El Sol', '456', 'San Juan de Miraflores', 'B', '10', 'DPTO', '101'),
  (3, '150101', 'AV', 'Arequipa', '789', 'Centro Comercial', 'C', '15', NULL, NULL);

-- Suministros de prueba
INSERT INTO suministro (codigo_cliente, codigo_direccion, tipo_suministro, fecha_alta, estado_suministro) VALUES
  (1, 1, 'domiciliario', '2023-01-15', 'activo'),
  (2, 2, 'domiciliario', '2023-06-20', 'activo'),
  (3, 3, 'comercial', '2023-03-10', 'activo');

-- Canales de pago de prueba
INSERT INTO canal_pago (modalidad_canal, tipo_canal, nombre_canal, dias_disponibles, hora_inicio_abierto, hora_fin_abierto, estado_canal, direccion, ubigeo) VALUES
  ('presencial', 'agencia_sedapal', 'Agencia San Juan', 'Lunes a Viernes', '08:00:00', '16:00:00', TRUE, 'Av. Primavera 100, San Juan', '150131'),
  ('presencial', 'banco', 'Interbank San Juan', 'Lunes a Viernes', '09:00:00', '17:00:00', TRUE, 'Av. El Sol 200, San Juan', '150131'),
  ('virtual', 'portal_web', 'Portal Web SEDAPAL', '24/7', NULL, NULL, TRUE, NULL, NULL),
  ('automatica', 'cajero_automatico', 'Cajero BCP San Juan', '24/7', NULL, NULL, TRUE, 'Av. Primavera 350, San Juan', '150131');

-- Facturas de prueba
INSERT INTO factura (codigo_suministro, fecha_inicio_consumo, fecha_fin_consumo, fecha_emision_factura, fecha_vencimiento_factura, consumo_agua_factura, monto_concepto_consumo, monto_concepto_alcantarillado, monto_concepto_cargo_fijo, monto_concepto_igv, monto_total, estado_factura) VALUES
  (1, '2026-06-01', '2026-06-30', '2026-07-01', '2026-07-15', 35.50, 95.50, 45.20, 8.50, 17.44, 166.64, 'cancelada'),
  (1, '2026-05-01', '2026-05-31', '2026-06-01', '2026-06-15', 42.30, 115.00, 52.50, 8.50, 25.75, 201.75, 'cancelada'),
  (2, '2026-06-01', '2026-06-30', '2026-07-01', '2026-07-15', 28.80, 78.00, 35.80, 8.50, 12.30, 134.60, 'vencida'),
  (3, '2026-06-01', '2026-06-30', '2026-07-01', '2026-07-15', 120.00, 325.00, 150.00, 25.00, 62.50, 562.50, 'emitida');

-- Incidencias de prueba
INSERT INTO incidencia (tipo_incidencia, fecha_inicio_incidencia, fecha_aviso_incidencia, estado_incidencia, descripcion, zona, ubigeo) VALUES
  ('fuga', '2026-06-28 10:30:00', '2026-06-28 11:00:00', 'en_proceso', 'Fuga en tubería matriz de la avenida principal', 'San Juan de Miraflores', '150131'),
  ('mantenimiento', '2026-07-01 08:00:00', '2026-07-01 08:15:00', 'en_proceso', 'Mantenimiento preventivo programado', 'San Juan de Miraflores', '150131');

-- Usuarios de prueba (password: Test1234! hash bcrypt)
INSERT INTO usuario_sistema (codigo_cliente, email, password_hash, nombre_completo, activo) VALUES
  (1, 'carlos.perez@example.com', '$2b$10$Z9w8Y7x6V5u4T3s2R1q0P.oNmLkJiHgFeDcBaZ9y8x7W6v5U4t3s2', 'Carlos Pérez López', TRUE),
  (NULL, 'admin@sedapal.pe', '$2b$10$Z9w8Y7x6V5u4T3s2R1q0P.oNmLkJiHgFeDcBaZ9y8x7W6v5U4t3s2', 'Administrador', TRUE);
