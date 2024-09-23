import { Controller, Get, Post, Put, Delete, Body, Route, SuccessResponse, Path , Security} from 'tsoa';
import { pool } from '../config/database'; // Adjust the path to your database connection
import { User } from '../models/user'; // Assuming you have a User model/interface

@Route('users')
export class UserController extends Controller {

  // Get all users

  @Get('/')
  
  
  public async getUsers(): Promise<User[]> {
    try {
      const result = await pool.query('SELECT * FROM users');
      return result.rows; // Return users without passwords
    } catch (error) {
      console.error('Error fetching users:', error);
      this.setStatus(500);
      throw new Error('Error fetching users');
    }
  }
  @SuccessResponse(200, 'Fetched users successfully')

  // Create a new user
  @Security('jwt', ['admin'])
  @Post('/')
  @SuccessResponse(201, 'User created') // HTTP 201
  public async createUser(
    @Body() requestBody: { first_name: string; last_name: string; email: string }
  ): Promise<User | { message: string }> {
    const { first_name, last_name, email} = requestBody;

    try {
      // Check if the username already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        this.setStatus(400);
        return { message: 'email already exists' };
      }

      // // Hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const result = await pool.query(
        `INSERT INTO access_member (first_name, last_name, email) 
                 VALUES ($1, $2, $3) RETURNING id, first_name, email`,
        [first_name, last_name, email]
      );

      this.setStatus(201);
      return result.rows[0]; // Return the created user
    } catch (error) {
      console.error('Error creating user:', error);
      this.setStatus(500);
      throw new Error('Error creating user');
    }
  }

  // Update a user by ID
  @Security('jwt', ['admin'])
  @Put('/:id')
  @SuccessResponse(200, 'User updated') // HTTP 200
  public async updateUser(
    @Path() id: number,
    @Body() requestBody: { first_name?: string; last_name?: string; email?: string}
  ): Promise<User | { message: string }> {
    const { first_name, last_name, email } = requestBody;

    try {
      const updateFields = [];
      const values = [];

      if (first_name) {
        updateFields.push(`first_name = $${updateFields.length + 1}`);
        values.push(first_name);
      }

      if (last_name) {
        updateFields.push(`last_name = $${updateFields.length + 1}`);
        values.push(last_name);
      }

      if (email) {
        updateFields.push(`email = $${updateFields.length + 1}`);
        values.push(email);
      }

      if (updateFields.length === 0) {
        this.setStatus(400);
        return { message: 'No fields to update' };
      }

      values.push(id); // Add id to the end of the values array

      const result = await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING id, first_name, email`,
        values
      );
      if (result.rows.length === 0) {
        this.setStatus(404);
        return { message: 'User not found' };
      }

      return result.rows[0]; // Return the updated user
    } catch (error) {
      console.error('Error updating user:', error);
      this.setStatus(500);
      throw new Error('Error updating user');
    }
  }

  // Delete a user by ID
  @Security('jwt', ['admin'])
  @Delete('/:id')
  @SuccessResponse(204, 'User deleted') // HTTP 204
  public async deleteUser(@Path() id: number): Promise<void> {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        this.setStatus(404);
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      this.setStatus(500);
      throw new Error('Error deleting user');
    }
  }
}
