import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/auth';
import projectRoutes from './routes/project.routes';
import reportRoutes from './routes/report.routes';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware for authenticating incoming requests
app.use(authenticateToken);

// Register project-related routes
app.use('/projects', projectRoutes);

// Register report-related routes
app.use('/reports', reportRoutes);

// Health check route to verify API is running
app.get('/', (req: Request, res: Response) => {
	res.send('API is working. Check console for project data.');
});

// Start the server
app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
