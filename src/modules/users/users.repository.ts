import { query } from "../../config/db/pool";
import { UserId } from "../auth/auth.schemas";
import { PublicUser, User } from "./users.types";

export type UsersPagination = {
  limit: number;
  offset: number;
};

const RETURNING_COLUMN = `
  RETURNING
            id,
            full_name AS "fullName",
            email,
            role,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
`;

const SELECT_COLUMN = `
  SELECT 
            id, 
            full_name AS "fullName", 
            email, 
            password_hash AS "passwordHash",
            role,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
            FROM users
            WHERE email = $1
`;

const SELECT_COLUMN_BY_ID_AND_EMAIL = `
SELECT 
            id, 
            full_name AS "fullName", 
            email, 
            role,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
            FROM users
            WHERE id = $1 AND email = $2
`;

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const rows = await query<User>(
      `${SELECT_COLUMN}
      `,
      [email],
    );
    return rows[0] ?? null;
  },

  async create(
    fullName: string,
    email: string,
    passwordHash: string,
  ): Promise<PublicUser> {
    const rows = await query<PublicUser>(
      `INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        ${RETURNING_COLUMN}
        `,
      [fullName, email, passwordHash],
    );

    const user = rows[0];
    if (!user) throw new Error("Insert returned no row");

    return user;
  },

  async update(
    userId: string,
    email: string,
    fullName: string,
  ): Promise<PublicUser> {
    const rows = await query<PublicUser>(
      `UPDATE users
            SET 
            full_name = COALESCE($3, full_name),
            updated_at = NOW()
            WHERE id = $1 AND email = $2
            ${RETURNING_COLUMN}
            `,
      [userId, email, fullName],
    );
    const user = rows[0];
    if (!user) throw new Error("Update returned no row");
    return user;
  },

  async deleteUser(userId: string, email: string): Promise<PublicUser> {
    const rows = await query<PublicUser>(
      `DELETE FROM users
         WHERE id = $1 AND email = $2
         ${RETURNING_COLUMN}
        `,
      [userId, email],
    );
    const user = rows[0];
    if (!user) throw new Error("Delete returned no row");

    return user;
  },

  async selectOneUser(id: UserId): Promise<User | null> {
    const rows = await query<User>(
      `SELECT
      id,
      full_name AS "fullName",
      email,
      role,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
      FROM users
      WHERE id = $1
      `,
      [id],
    );

    const user = rows[0];
    if (!user) throw new Error("Select returned no row");

    return user;
  },

  async selectAllUsers(): Promise<PublicUser[] | []> {
    const rows = await query<PublicUser>(
      `SELECT 
            id, 
            full_name AS "fullName", 
            email,
            role,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
            FROM users
            ORDER BY created_at DESC, id DESC
        `,
    );
    if (!rows) throw new Error("Select returned no rows");

    return rows;
  },

  async findByIdAndEmail(
    id: UserId,
    email: string,
  ): Promise<PublicUser | null> {
    const rows = await query<PublicUser>(
      `${SELECT_COLUMN_BY_ID_AND_EMAIL}
      `,
      [id, email],
    );

    const user = rows[0];
    return user ?? null;
  },
};
