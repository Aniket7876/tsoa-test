// import { pool } from '../config/database'; // Import your pool from the connection file
// import users, { User } from '../models/user'; // Adjust the path to your users file

// const insertUsersToDB = async () => {
//   for (const user of users) {
//     try {
//       const query = `
//         INSERT INTO access_member (username, password, role)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (username) DO NOTHING;
//       `;
//       const values = [user.username, user.password, user.role];

//       // Use pool to query the database
//       await pool.query(query, values);

//       console.log(`Inserted user: ${user.username}`);
//     } catch (error) {
//       console.error(`Error inserting user ${user.username}:`, error);
//     }
//   }
// };

//insertUsersToDB();
