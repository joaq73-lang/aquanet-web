-- ============================================================================
-- Migración: redefine los enums de estado a los valores solicitados
-- Segura para bases de datos que ya tienen datos (usa el patrón
-- text -> remap -> nuevo enum, en vez de DROP TYPE ... CASCADE).
--
-- Mapeo de valores viejos -> nuevos (donde no coinciden literalmente):
--   estado_cliente:   inactivo->baja, bloqueado->suspendido
--   estado_consulta:  asignada->registrada (ya no existe "asignada")
--   estado_factura:   emitida->pendiente, cancelada->pagada, parcial->pendiente
--   estado_incidencia: reportada->registrada, asignada->notificada, en_proceso->en_atencion
--   estado_reclamo:   asignado->derivado, en_investigacion->en_evaluacion, cerrado->notificado, denegado->rechazado
--   estado_suministro: inactivo->baja, cortado->suspendido
--   tipo_reclamo:     factura_error->facturacion, medidor_dañado->medidor_agua,
--                      servicio_deficiente->servicio_agua_potable, calidad_agua->servicio_agua_potable,
--                      otro->corte_restablecimiento
--
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- estado_cliente: (activo, inactivo, suspendido, bloqueado)
--              -> (registrado, activo, suspendido, baja)
-- ---------------------------------------------------------------------------
ALTER TABLE cliente ALTER COLUMN estado_cliente DROP DEFAULT;
ALTER TABLE cliente ALTER COLUMN estado_cliente TYPE TEXT USING estado_cliente::text;
UPDATE cliente SET estado_cliente = CASE estado_cliente
  WHEN 'inactivo' THEN 'baja'
  WHEN 'bloqueado' THEN 'suspendido'
  ELSE estado_cliente
END;
DROP TYPE estado_cliente;
CREATE TYPE estado_cliente AS ENUM ('registrado', 'activo', 'suspendido', 'baja');
ALTER TABLE cliente ALTER COLUMN estado_cliente TYPE estado_cliente USING estado_cliente::estado_cliente;
ALTER TABLE cliente ALTER COLUMN estado_cliente SET DEFAULT 'activo';

-- ---------------------------------------------------------------------------
-- estado_consulta: (registrada, asignada, en_proceso, respondida, cerrada)
--               -> (registrada, en_proceso, respondida, cerrada)
-- ---------------------------------------------------------------------------
ALTER TABLE consulta ALTER COLUMN estado_consulta DROP DEFAULT;
ALTER TABLE consulta ALTER COLUMN estado_consulta TYPE TEXT USING estado_consulta::text;
UPDATE consulta SET estado_consulta = CASE estado_consulta
  WHEN 'asignada' THEN 'registrada'
  ELSE estado_consulta
END;
DROP TYPE estado_consulta;
CREATE TYPE estado_consulta AS ENUM ('registrada', 'en_proceso', 'respondida', 'cerrada');
ALTER TABLE consulta ALTER COLUMN estado_consulta TYPE estado_consulta USING estado_consulta::estado_consulta;
ALTER TABLE consulta ALTER COLUMN estado_consulta SET DEFAULT 'registrada';

-- ---------------------------------------------------------------------------
-- estado_factura: (emitida, cancelada, parcial, vencida, anulada)
--              -> (pendiente, vencida, en_disputa, anulada, pagada)
-- ---------------------------------------------------------------------------
ALTER TABLE factura ALTER COLUMN estado_factura DROP DEFAULT;
ALTER TABLE factura ALTER COLUMN estado_factura TYPE TEXT USING estado_factura::text;
UPDATE factura SET estado_factura = CASE estado_factura
  WHEN 'emitida' THEN 'pendiente'
  WHEN 'cancelada' THEN 'pagada'
  WHEN 'parcial' THEN 'pendiente'
  ELSE estado_factura
END;
DROP TYPE estado_factura;
CREATE TYPE estado_factura AS ENUM ('pendiente', 'vencida', 'en_disputa', 'anulada', 'pagada');
ALTER TABLE factura ALTER COLUMN estado_factura TYPE estado_factura USING estado_factura::estado_factura;
ALTER TABLE factura ALTER COLUMN estado_factura SET DEFAULT 'pendiente';

-- ---------------------------------------------------------------------------
-- estado_incidencia: (reportada, asignada, en_proceso, resuelta, cerrada)
--                 -> (registrada, notificada, en_atencion, resuelta, cerrada)
-- ---------------------------------------------------------------------------
ALTER TABLE incidencia ALTER COLUMN estado_incidencia DROP DEFAULT;
ALTER TABLE incidencia ALTER COLUMN estado_incidencia TYPE TEXT USING estado_incidencia::text;
UPDATE incidencia SET estado_incidencia = CASE estado_incidencia
  WHEN 'reportada' THEN 'registrada'
  WHEN 'asignada' THEN 'notificada'
  WHEN 'en_proceso' THEN 'en_atencion'
  ELSE estado_incidencia
END;
DROP TYPE estado_incidencia;
CREATE TYPE estado_incidencia AS ENUM ('registrada', 'notificada', 'en_atencion', 'resuelta', 'cerrada');
ALTER TABLE incidencia ALTER COLUMN estado_incidencia TYPE estado_incidencia USING estado_incidencia::estado_incidencia;
ALTER TABLE incidencia ALTER COLUMN estado_incidencia SET DEFAULT 'registrada';

-- ---------------------------------------------------------------------------
-- estado_reclamo: (registrado, asignado, en_investigacion, resuelto, cerrado, denegado)
--              -> (registrado, pendiente, en_evaluacion, observado, derivado, rechazado, resuelto, notificado)
-- ---------------------------------------------------------------------------
ALTER TABLE reclamo ALTER COLUMN estado_reclamo DROP DEFAULT;
ALTER TABLE reclamo ALTER COLUMN estado_reclamo TYPE TEXT USING estado_reclamo::text;
UPDATE reclamo SET estado_reclamo = CASE estado_reclamo
  WHEN 'asignado' THEN 'derivado'
  WHEN 'en_investigacion' THEN 'en_evaluacion'
  WHEN 'cerrado' THEN 'notificado'
  WHEN 'denegado' THEN 'rechazado'
  ELSE estado_reclamo
END;
DROP TYPE estado_reclamo;
CREATE TYPE estado_reclamo AS ENUM ('registrado', 'pendiente', 'en_evaluacion', 'observado', 'derivado', 'rechazado', 'resuelto', 'notificado');
ALTER TABLE reclamo ALTER COLUMN estado_reclamo TYPE estado_reclamo USING estado_reclamo::estado_reclamo;
ALTER TABLE reclamo ALTER COLUMN estado_reclamo SET DEFAULT 'pendiente';

-- ---------------------------------------------------------------------------
-- estado_suministro: (activo, inactivo, cortado, suspendido)
--                 -> (registrado, activo, baja, suspendido)
-- ---------------------------------------------------------------------------
ALTER TABLE suministro ALTER COLUMN estado_suministro DROP DEFAULT;
ALTER TABLE suministro ALTER COLUMN estado_suministro TYPE TEXT USING estado_suministro::text;
UPDATE suministro SET estado_suministro = CASE estado_suministro
  WHEN 'inactivo' THEN 'baja'
  WHEN 'cortado' THEN 'suspendido'
  ELSE estado_suministro
END;
DROP TYPE estado_suministro;
CREATE TYPE estado_suministro AS ENUM ('registrado', 'activo', 'baja', 'suspendido');
ALTER TABLE suministro ALTER COLUMN estado_suministro TYPE estado_suministro USING estado_suministro::estado_suministro;
ALTER TABLE suministro ALTER COLUMN estado_suministro SET DEFAULT 'activo';

-- ---------------------------------------------------------------------------
-- tipo_reclamo: (medidor_dañado, factura_error, servicio_deficiente, calidad_agua, otro)
--            -> (facturacion, medidor_agua, servicio_agua_potable, servicio_alcantarillado,
--                fugas_agua, conexion_agua_desague, corte_restablecimiento)
-- ---------------------------------------------------------------------------
ALTER TABLE reclamo ALTER COLUMN tipo_reclamo TYPE TEXT USING tipo_reclamo::text;
UPDATE reclamo SET tipo_reclamo = CASE tipo_reclamo
  WHEN 'factura_error' THEN 'facturacion'
  WHEN 'medidor_dañado' THEN 'medidor_agua'
  WHEN 'servicio_deficiente' THEN 'servicio_agua_potable'
  WHEN 'calidad_agua' THEN 'servicio_agua_potable'
  WHEN 'otro' THEN 'corte_restablecimiento'
  ELSE tipo_reclamo
END;
DROP TYPE tipo_reclamo;
CREATE TYPE tipo_reclamo AS ENUM (
  'facturacion',
  'medidor_agua',
  'servicio_agua_potable',
  'servicio_alcantarillado',
  'fugas_agua',
  'conexion_agua_desague',
  'corte_restablecimiento'
);
ALTER TABLE reclamo ALTER COLUMN tipo_reclamo TYPE tipo_reclamo USING tipo_reclamo::tipo_reclamo;

-- ---------------------------------------------------------------------------
-- canal_pago.estado_canal ya es BOOLEAN (Disponible = TRUE, No disponible = FALSE),
-- no requiere cambio de tipo.
-- ---------------------------------------------------------------------------

COMMIT;
