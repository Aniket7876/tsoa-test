import { Pool } from 'pg';

// Create a pool to manage connections
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ts_node_api',
  password: 'ANIKETg.007', // Use environment variables for production
  port: 5432
});

// Connect to the database
export const connectDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to the database!');
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
};
 