// /src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;

export function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers['authorization'];

	if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	next();
}
