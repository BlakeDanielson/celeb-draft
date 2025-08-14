import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Ensure a fresh SQLite test database and push schema
export function setupTestDatabase() {
	const dbPath = path.resolve(__dirname, "../../prisma/dev.test.db");
	const url = `file:${dbPath}`;
	process.env.DATABASE_URL = url;
	// Remove old test DB if exists
	try { fs.unlinkSync(dbPath); } catch {}
	// Run prisma db push to materialize schema
	execSync("npx prisma db push", { cwd: path.resolve(__dirname, "../../"), stdio: "inherit" });
}

export function cleanupTestDatabase() {
	const dbPath = path.resolve(__dirname, "../../prisma/dev.test.db");
	try { fs.unlinkSync(dbPath); } catch {}
}


