import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { pool, withTransaction } from "@/lib/db";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const passwordRule =
  "Password must be at least 8 characters and include a lowercase letter, a number, and one of $, @, or _.";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  return password.length >= 8 && /[a-z]/.test(password) && /\d/.test(password) && /[$@_]/.test(password);
}

function toProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    displayName: String(row.display_name),
    email: String(row.email),
    phoneNumber: row.phone_number ? String(row.phone_number) : null,
    address: row.address ? String(row.address) : null,
    status: String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function insertSession(client: PoolClient, userId: string) {
  const token = randomUUID();
  await client.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
    [token, userId],
  );
  return token;
}

export async function createUser(input: {
  displayName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const email = normalizeEmail(input.email);

  return withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO users (id, display_name, email, password_hash, phone_number, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, display_name, email, phone_number, address, status, created_at, updated_at`,
      [randomUUID(), input.displayName.trim(), email, passwordHash, input.phoneNumber?.trim() || null, input.address?.trim() || null],
    );
    const user = toProfile(result.rows[0]);
    const sessionToken = await insertSession(client, user.id);
    return { user, sessionToken };
  });
}

export async function authenticateUser(emailInput: string, password: string) {
  const result = await pool.query(
    "SELECT id, display_name, email, password_hash, phone_number, address, status, created_at, updated_at FROM users WHERE email = $1",
    [normalizeEmail(emailInput)],
  );
  const row = result.rows[0];

  if (!row || row.status !== "active" || !(await bcrypt.compare(password, row.password_hash))) {
    return null;
  }

  return withTransaction(async (client) => {
    const user = toProfile(row);
    const sessionToken = await insertSession(client, user.id);
    return { user, sessionToken };
  });
}

export async function getUserBySession(sessionToken: string) {
  const result = await pool.query(
    `SELECT u.id, u.display_name, u.email, u.phone_number, u.address, u.status, u.created_at, u.updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [sessionToken],
  );
  return result.rows[0] ? toProfile(result.rows[0]) : null;
}
