import { neon } from "@neondatabase/serverless";

const isMock = process.env.DATABASE_URL === "your-postgres-connection-string" || !process.env.DATABASE_URL;

let sql;

if (isMock) {
    console.warn("⚠️  WARNING: DATABASE_URL is not set. Using Mock DB to prevent crash.");
    console.warn("⚠️  Please update server/.env with your actual Neon connection string.");

    // Mock SQL function to prevent crash
    sql = async (strings, ...values) => {
        console.log("📝 [MOCK DB] Query Executed:", strings[0]);
        return []; // Return empty array or mock data
    };
} else {
    try {
        sql = neon(`${process.env.DATABASE_URL}`);
    } catch (error) {
        console.error("❌ Failed to initialize Neon DB client:", error.message);
        // Fallback to mock on error
        sql = async () => { throw new Error("Database connection failed. Check server console."); };
    }
}

export default sql;
