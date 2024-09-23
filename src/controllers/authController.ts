import { Controller, Post, Body, Route, SuccessResponse } from 'tsoa';
import { pool } from '../config/database'; // Adjust the path to your database connection
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for JWT_SECRET
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // Use environment variable for expiration time

interface AuthResponse {
  token?: string; // token is optional in case of an error
  message?: string; // message will be returned in case of an error
}


@Route('auth')
export class AuthController extends Controller {
  
  // User registration
  @Post('register')
  @SuccessResponse(201, 'User registered')
  public async register(@Body() requestBody: { username: string; password: string; role: string }): Promise<any> {
    const { username, password, role } = requestBody;

    try {
      // Check if username already exists
      const userExists = await pool.query('SELECT * FROM access_member WHERE username = $1', [username]);
      if (userExists.rows.length > 0) {
        this.setStatus(400); // Bad Request
        return { message: 'Username already exists' };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const result = await pool.query(
        `INSERT INTO access_member (username, password, role) 
         VALUES ($1, $2, $3) RETURNING id, username, role`,
        [username, hashedPassword, role]
      );

      // Return the created user without the password
      const newUser = result.rows[0];
      this.setStatus(201);
      return { user: { id: newUser.id, username: newUser.username, role: newUser.role } };
    } catch (error) {
      console.error('Error registering user:', error);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }

  // User login
  @Post('login')
  public async login(@Body() requestBody: { username: string; password: string }): Promise<AuthResponse> {
    const { username, password } = requestBody;
  
    try {
      // Find the user by username
      const result = await pool.query('SELECT * FROM access_member WHERE username = $1', [username]);
      const user = result.rows[0];
      if (!user) {
        this.setStatus(401); // Unauthorized
        throw new Error('Invalid credentials');
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        this.setStatus(401); // Unauthorized
        throw new Error('Invalid credentials');
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION
      });
  
      return { token };
    } catch (error) {
      console.error('Error logging in:', error);
      this.setStatus(500); // Internal Server Error
      throw new Error('Internal server error');
    }
  }
  

  // User logout
  @Post('logout')
  public async logout(@Body() requestBody: { token: string }): Promise<{ message: string }> {
    const { token } = requestBody;

    if (!token) {
      this.setStatus(400); // Bad Request
      return { message: 'No token provided' };
    }

    try {
      // Add token to blacklist
      await pool.query('INSERT INTO token_blacklist (token) VALUES ($1)', [token]);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}

// import { pool } from '../config/database'; // Adjust the path to your database connection
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { Request, Response } from 'express';

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for JWT_SECRET

// // User registration
// export const register = async (req: Request, res: Response) => {
//   const { username, password, role } = req.body;

//   try {
//     // Check if the username already exists
//     const userExists = await pool.query('SELECT * FROM access_member WHERE username = $1', [username]);

//     if (userExists.rows.length > 0) {
//       return res.status(400).json({ message: 'Username already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert the new user into the database
//     const result = await pool.query(
//       `INSERT INTO access_member (username, password, role)
//          VALUES ($1, $2, $3) RETURNING id, username, role`,
//       [username, hashedPassword, role]
//     );

//     // Return the created user (without the password)
//     const newUser = result.rows[0];
//     res.status(201).json({ message: 'User registered', user: newUser });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ message: 'Error registering user' });
//   }
// };

// // User registration (example only, passwords should be hashed)
// // User login
// export const login = async (req: Request, res: Response) => {
//   const { username, password } = req.body;

//   try {
//     // Find the user by username in the database
//     const result = await pool.query('SELECT * FROM access_member WHERE username = $1', [username]);

//     const user = result.rows[0];

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
//       expiresIn: '1h'
//     });
//     res.json({ token });
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ message: 'Error logging in' });
//   }
// };

// export const logout = async (req: Request, res: Response) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

//   if (!token) {
//     return res.status(400).json({ message: 'No token provided' });
//   }

//   try {
//     // Add token to blacklist
//     await pool.query('INSERT INTO token_blacklist (token) VALUES ($1)', [token]);
//     res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Error logging out:', error);
//     res.status(500).json({ message: 'Error logging out' });
//   }
// };
