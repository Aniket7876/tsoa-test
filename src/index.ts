import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../dist/swagger.json';

const app = express();
app.use(express.json());

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// TSOA routes
RegisterRoutes(app);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


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
