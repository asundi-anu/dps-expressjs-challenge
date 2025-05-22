import { Router, Request, Response } from 'express';
import db from '../services/db.service';

// Router setup for handling project-related API endpoints.
const router = Router();

// Utility to check if any word appears >= 3 times
function hasRepeatedWord(content: string): boolean {
	if (!content) return false;

	const wordCounts: Record<string, number> = {};

	const words = content
		.toLowerCase()
		.replace(/[^a-z0-9\s]/gi, '') // remove punctuation
		.split(/\s+/); // split by whitespace

	for (const word of words) {
		if (!word) continue;
		wordCounts[word] = (wordCounts[word] || 0) + 1;
		if (wordCounts[word] >= 3) return true;
	}

	return false;
}

// Special Reports Endpoint
interface Report {
	id: string;
	text: string;
	project_id: string;
}

// GET /reports/repeated-words
router.get('/repeated-words', (req: Request, res: Response) => {
	try {
		const reports = db.query('SELECT * FROM reports');
		const filtered = (reports as Report[]).filter((report: Report) =>
			hasRepeatedWord(report.text),
		);
		res.json(filtered);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to retrieve reports' });
	}
});

// Create Report
router.post('/', (req: Request, res: Response) => {
	try {
		const { id, title, text, project_id } = req.body;

		if (!id || !title || !project_id) {
			return res
				.status(400)
				.json({ error: 'id, title, and project_id are required' });
		}

		// Check for duplicate id
		const existing = db.query('SELECT id FROM reports WHERE id = @id', {
			id,
		});
		if (existing.length > 0) {
			return res
				.status(409)
				.json({ error: 'Report with this id already exists' });
		}

		db.run(
			'INSERT INTO reports (id, title, text, project_id) VALUES (@id, @title, @text, @project_id)',
			{ id, title, text, project_id },
		);

		res.status(201).json({ id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to create report' });
	}
});

// Get All Reports
router.get('/', (_req: Request, res: Response) => {
	try {
		const reports = db.query('SELECT * FROM reports');
		res.json(reports);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch reports' });
	}
});

// Get Single Report
router.get('/:id', (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const report = db.query('SELECT * FROM reports WHERE id = @id', { id });

		if (report.length === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json(report[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch report' });
	}
});

// Update Report
router.put('/:id', (req: Request, res: Response) => {
	try {
		const { title, text } = req.body;
		const { id } = req.params;

		if (!title) {
			return res.status(400).json({ error: 'Title is required' });
		}

		const result = db.run(
			'UPDATE reports SET title = @title, text = @text WHERE id = @id',
			{ id, title, text },
		);

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json({ updated: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to update report' });
	}
});

// Delete Report
router.delete('/:id', (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const result = db.run('DELETE FROM reports WHERE id = @id', { id });

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json({ deleted: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to delete report' });
	}
});

// Export the configured router for use in the main app.
export default router;
