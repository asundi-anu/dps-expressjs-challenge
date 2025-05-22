import { Router, Request, Response } from 'express';
import db from '../services/db.service';

// Router setup for handling project-related API endpoints.
const router = Router();

// Create /project - created project
router.post('/', (req: Request, res: Response) => {
	try {
		const { id, name, description } = req.body;

		// Basic validation: check required fields
		if (!id || !name) {
			return res.status(400).json({ error: 'id and name are required' });
		}

		// Optional: check if id already exists to prevent duplicates
		const existing = db.query('SELECT id FROM projects WHERE id = @id', {
			id,
		});
		if (existing.length > 0) {
			return res
				.status(409)
				.json({ error: 'Project with this id already exists' });
		}

		db.run(
			'INSERT INTO projects (id, name, description) VALUES (@id, @name, @description)',
			{ id, name, description },
		);

		res.status(201).json({ id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to create project' });
	}
});

// GET /projects - Get all projects
router.get('/', (req: Request, res: Response) => {
	try {
		const projects = db.query('SELECT * FROM projects');
		res.json(projects);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch projects' });
	}
});

// Update project
router.put('/:id', (req: Request, res: Response) => {
	try {
		const { name, description } = req.body;
		const { id } = req.params;

		if (!name) {
			return res.status(400).json({ error: 'Name is required' });
		}

		const result = db.run(
			'UPDATE projects SET name = @name, description = @description WHERE id = @id',
			{ id, name, description },
		);

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}

		res.json({ updated: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to update project' });
	}
});

// Delete project
router.delete('/:id', (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = db.run('DELETE FROM projects WHERE id = @id', { id });

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}

		res.json({ deleted: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to delete project' });
	}
});

// Export the configured router for use in the main app.
export default router;
