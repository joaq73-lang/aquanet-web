-- ============================================================================
-- Crea el usuario de prueba que el login menciona (prueba@aquanet.test / Test1234!)
-- Este usuario nunca existió en los datos de prueba de schema.sql: los
-- usuarios sembrados ahí usan otros correos y, además, su password_hash es
-- un placeholder inventado, no un hash bcrypt real. El hash de abajo sí es
-- un hash bcrypt real (costo 10) de la contraseña "Test1234!".
--
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- ============================================================================

WITH nuevo_cliente AS (
  INSERT INTO cliente (tipo_cliente, telefono, correo, estado_cliente)
  VALUES ('individual', '999111222', 'prueba@aquanet.test', 'activo')
  RETURNING codigo_cliente
),
nuevo_individual AS (
  INSERT INTO cliente_individual (codigo_cliente, tipo_documento, nro_documento, nombres, apellido_paterno, apellido_materno)
  SELECT codigo_cliente, 'DNI', '99911122', 'Usuario', 'De', 'Prueba'
  FROM nuevo_cliente
  RETURNING codigo_cliente
),
nuevo_usuario AS (
  INSERT INTO usuario_sistema (codigo_cliente, email, password_hash, nombre_completo, activo)
  SELECT codigo_cliente, 'prueba@aquanet.test',
         '$2b$10$UgMzmkozMa9MUJcXNFQObe0Jab/.LcZ9kZ2uPfwtpOTVHu6eezEom',
         'Usuario De Prueba', TRUE
  FROM nuevo_individual
  RETURNING codigo_cliente
),
nueva_direccion AS (
  INSERT INTO direccion (codigo_cliente, ubigeo, tipo_via, nombre_via, nro_via, urbanizacion, manzana, nro_lote)
  SELECT codigo_cliente, '150131', 'AV', 'Los Próceres', '1234', 'San Juan de Lurigancho', 'A', '10'
  FROM nuevo_usuario
  RETURNING codigo_direccion, codigo_cliente
),
nuevo_suministro AS (
  INSERT INTO suministro (codigo_cliente, codigo_direccion, tipo_suministro, fecha_alta, estado_suministro)
  SELECT codigo_cliente, codigo_direccion, 'domiciliario', '2024-01-10', 'activo'
  FROM nueva_direccion
  RETURNING codigo_suministro
)
INSERT INTO factura (
  codigo_suministro, fecha_inicio_consumo, fecha_fin_consumo, fecha_emision_factura,
  fecha_vencimiento_factura, consumo_agua_factura, monto_concepto_consumo,
  monto_concepto_alcantarillado, monto_concepto_cargo_fijo, monto_concepto_igv,
  monto_total, estado_factura
)
SELECT codigo_suministro, '2026-06-01', '2026-06-30', '2026-07-01', '2026-07-15',
       22.00, 60.00, 28.00, 8.50, 10.80, 107.30, 'emitida'
FROM nuevo_suministro;
