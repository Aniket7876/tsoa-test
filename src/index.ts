import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../dist/swagger.json';
import {connectDatabase} from './config/database';

const app = express();
app.use(express.json());

const port =3000

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// TSOA routes
RegisterRoutes(app);

async function startServer() {
  try {
    // Attempt to connect to the database and log the message
    const dbConnectionMessage = await connectDatabase();
    console.log(dbConnectionMessage); // Log the result from the database connection

    // Start the server after the database is connected
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
}

startServer();




// import express from 'express';
// import userRoutes from './routes/userRoutes';
// import cookieParser from 'cookie-parser';

// const app = express();
// app.use(express.json()); // Middleware to parse JSON
// // In your app setup
// app.use(cookieParser());

// // Routes
// app.use('/api', userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
