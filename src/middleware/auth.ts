import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// This function is required by TSOA to handle authentication
export const expressAuthentication = async (request: Request, securityName: string, scopes?: string[]): Promise<any> => {
  if (securityName === 'jwt') {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      // Check if the token is blacklisted
      const blacklistCheck = await pool.query('SELECT * FROM token_blacklist WHERE token = $1', [token]);

      if (blacklistCheck.rows.length > 0) {
        throw new Error('Token is blacklisted');
      }

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

      // Check role if scopes are specified
      if (scopes && !scopes.includes(decoded.role)) {
        throw new Error('Insufficient role');
      }

      return decoded; // Return the decoded token (user info)
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  throw new Error('Unknown security name');
};
