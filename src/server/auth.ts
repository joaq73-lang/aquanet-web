import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query, getClient } from "./db";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "aquanet-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  codigo_usuario: number;
  codigo_cliente: number | null;
  email: string;
  nombre_completo: string | null;
}

export interface AuthContext {
  usuario: AuthUser;
  codigo_cliente?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      codigo_usuario: user.codigo_usuario,
      codigo_cliente: user.codigo_cliente,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      codigo_usuario: decoded.codigo_usuario,
      codigo_cliente: decoded.codigo_cliente,
      email: decoded.email,
      nombre_completo: null,
    };
  } catch (error) {
    return null;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const result = await query(
      `SELECT u.*, c.tipo_cliente
       FROM usuario_sistema u
       LEFT JOIN cliente c ON u.codigo_cliente = c.codigo_cliente
       WHERE u.email = $1 AND u.activo = TRUE`,
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    // Actualizar último login
    await query(`UPDATE usuario_sistema SET fecha_ultimo_login = NOW() WHERE codigo_usuario = $1`, [
      user.codigo_usuario,
    ]);

    const authUser: AuthUser = {
      codigo_usuario: user.codigo_usuario,
      codigo_cliente: user.codigo_cliente,
      email: user.email,
      nombre_completo: user.nombre_completo,
    };

    const token = generateToken(authUser);

    return { user: authUser, token };
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
}

export async function registerCliente(data: {
  tipo_cliente: "individual" | "empresa";
  documento_tipo: string;
  documento_numero: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  ruc?: string;
  razon_social?: string;
  telefono?: string;
  correo: string;
  password: string;
}): Promise<{ user: AuthUser; token: string } | null> {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    // Insertar cliente base
    const clienteResult = await client.query(
      `INSERT INTO cliente (tipo_cliente, telefono, correo, estado_cliente)
       VALUES ($1, $2, $3, 'activo')
       RETURNING codigo_cliente`,
      [data.tipo_cliente, data.telefono, data.correo],
    );

    const codigo_cliente = clienteResult.rows[0].codigo_cliente;

    // Insertar especialización
    if (data.tipo_cliente === "individual") {
      await client.query(
        `INSERT INTO cliente_individual (codigo_cliente, tipo_documento, nro_documento, nombres, apellido_paterno, apellido_materno)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          codigo_cliente,
          data.documento_tipo,
          data.documento_numero,
          data.nombres,
          data.apellido_paterno,
          data.apellido_materno,
        ],
      );
    } else {
      await client.query(
        `INSERT INTO cliente_empresa (codigo_cliente, ruc, razon_social)
         VALUES ($1, $2, $3)`,
        [codigo_cliente, data.ruc, data.razon_social],
      );
    }

    // Crear usuario del sistema
    const password_hash = await hashPassword(data.password);
    const nombre_completo =
      data.tipo_cliente === "individual"
        ? `${data.nombres || ""} ${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim()
        : data.razon_social || "";

    const usuarioResult = await client.query(
      `INSERT INTO usuario_sistema (codigo_cliente, email, password_hash, nombre_completo, activo)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING codigo_usuario`,
      [codigo_cliente, data.correo, password_hash, nombre_completo],
    );

    const authUser: AuthUser = {
      codigo_usuario: usuarioResult.rows[0].codigo_usuario,
      codigo_cliente,
      email: data.correo,
      nombre_completo,
    };

    const token = generateToken(authUser);

    await client.query("COMMIT");

    return { user: authUser, token };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en registro:", error);
    return null;
  } finally {
    client.release();
  }
}

export function requireAuth(request: Request): AuthContext {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "No autorizado - Token no proporcionado");
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);

  if (!user) {
    throw new HttpError(401, "No autorizado - Token inválido");
  }

  return {
    usuario: user,
    codigo_cliente: user.codigo_cliente || undefined,
  };
}

export function optionalAuth(request: Request): AuthContext | null {
  try {
    return requireAuth(request);
  } catch {
    return null;
  }
}
