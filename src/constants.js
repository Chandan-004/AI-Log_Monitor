import dotenv from 'dotenv'
dotenv.config()

export const DB_CONFIG = {
    user: "postgres",
    host: "localhost",
    database: "myapp_db",
    port: 5432,
    password: process.env.DB_PASSWORD,
    ssl: false 
};



