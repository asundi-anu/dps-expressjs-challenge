import sqlite from 'better-sqlite3';
import path from 'path';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const db = new sqlite(path.resolve('./db/db.sqlite3'), {
	fileMustExist: true,
});
const app: Express = express();

app.use(express.json());

// ---------- DB HELPERS ----------
function query(
	sql: string,
	params?: { [key: string]: string | number | undefined },
) {
	return params ? db.prepare(sql).all(params) : db.prepare(sql).all();
}

function run(
	sql: string,
	params?: { [key: string]: string | number | undefined },
) {
	return params ? db.prepare(sql).run(params) : db.prepare(sql).run();
}

// ---------- PROJECT ROUTES ----------

// Create Project
app.post('/projects', (req: Request, res: Response) => {
	const { name, description } = req.body;
	const result = run(
		'INSERT INTO projects (name, description) VALUES (@name, @description)',
		{ name, description },
	);
	res.status(201).json({ id: result.lastInsertRowid });
});

// Get All Projects
app.get('/projects', (_req: Request, res: Response) => {
	const projects = query('SELECT * FROM projects');
	res.json(projects);
});

// Get Single Project
app.get('/projects/:id', (req: Request, res: Response) => {
	const project = query('SELECT * FROM projects WHERE id = @id', {
		id: req.params.id,
	});
	if (!project.length) {
		return res.status(404).json({ error: 'Project not found' });
	}
	res.json(project[0]);
});

// Update Project
app.put('/projects/:id', (req: Request, res: Response) => {
	const { name, description } = req.body;
	const result = run(
		'UPDATE projects SET name = @name, description = @description WHERE id = @id',
		{ id: req.params.id, name, description },
	);
	if (result.changes === 0) {
		return res.status(404).json({ error: 'Project not found' });
	}
	res.json({ updated: true });
});

// Delete Project
app.delete('/projects/:id', (req: Request, res: Response) => {
	const result = run('DELETE FROM projects WHERE id = @id', {
		id: req.params.id,
	});
	if (result.changes === 0) {
		return res.status(404).json({ error: 'Project not found' });
	}
	res.json({ deleted: true });
});

// ---------- REPORT ROUTES ----------

// Create Report for Project
app.post('/projects/:projectId/reports', (req: Request, res: Response) => {
	const { title, content } = req.body;
	const result = run(
		'INSERT INTO reports (project_id, title, content) VALUES (@projectId, @title, @content)',
		{ projectId: req.params.projectId, title, content },
	);
	res.status(201).json({ id: result.lastInsertRowid });
});

// Get All Reports for a Project
app.get('/projects/:projectId/reports', (req: Request, res: Response) => {
	const reports = query(
		'SELECT * FROM reports WHERE project_id = @projectId',
		{
			projectId: req.params.projectId,
		},
	);
	res.json(reports);
});

// Get Single Report
app.get('/reports/:id', (req: Request, res: Response) => {
	const report = query('SELECT * FROM reports WHERE id = @id', {
		id: req.params.id,
	});
	if (!report.length) {
		return res.status(404).json({ error: 'Report not found' });
	}
	res.json(report[0]);
});

// Update Report
app.put('/reports/:id', (req: Request, res: Response) => {
	const { title, content } = req.body;
	const result = run(
		'UPDATE reports SET title = @title, content = @content WHERE id = @id',
		{ id: req.params.id, title, content },
	);
	if (result.changes === 0) {
		return res.status(404).json({ error: 'Report not found' });
	}
	res.json({ updated: true });
});

// Delete Report
app.delete('/reports/:id', (req: Request, res: Response) => {
	const result = run('DELETE FROM reports WHERE id = @id', {
		id: req.params.id,
	});
	if (result.changes === 0) {
		return res.status(404).json({ error: 'Report not found' });
	}
	res.json({ deleted: true });
});

export default { query, run };
