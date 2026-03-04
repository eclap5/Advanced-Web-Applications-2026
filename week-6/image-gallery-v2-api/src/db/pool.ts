/**
 * Database connection pool setup
 * 
 * This module could also be introduced as the infrastructure configuration layer, but in the sake of simplicity, this will be kept as a simple database configuration module.
 */

import { Pool } from "@db/postgres";

// connection string format: postgres://username:password@host:port/database
const DATABASE_URL = "postgres://postgres:postgres@localhost:5432/image-gallery-v2";   // Deno.env.get("DATABASE_URL"); // NOSONAR
if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable");
}

// Create a connection pool with 5 connections and enable lazy connection (connections will be established on demand)
export const pool = new Pool(DATABASE_URL, 5, true);