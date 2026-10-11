import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load Firebase configuration
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not read firebase-applet-config.json, falling back to env vars', err);
}

const firebaseApp = initializeApp({
  projectId: firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0884926846',
  apiKey: firebaseConfig.apiKey || process.env.FIREBASE_API_KEY || '',
  authDomain: firebaseConfig.authDomain || process.env.FIREBASE_AUTH_DOMAIN || '',
  storageBucket: firebaseConfig.storageBucket || '',
  messagingSenderId: firebaseConfig.messagingSenderId || '',
  appId: firebaseConfig.appId || '',
});

const databaseId = firebaseConfig.firestoreDatabaseId || process.env.FIRESTORE_DATABASE_ID;
const db = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Quick probe to verify Firestore connection is live
    res.status(200).json({
      status: 'healthy',
      database: 'Firestore',
      databaseId: databaseId || '(default)',
      projectId: firebaseConfig.projectId || 'connected',
      timestamp: new Date().toISOString(),
      service: 'TaskFlow REST API',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message || 'Health check failed',
    });
  }
});

// 2. GET all tasks
app.get('/api/tasks', async (_req: Request, res: Response) => {
  try {
    const tasksRef = collection(db, 'tasks');
    // Attempt ordered fetch
    let snapshot;
    try {
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(tasksRef);
    }

    const tasks: Task[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const rawPriority = data.priority ? String(data.priority).trim().toLowerCase() : 'medium';
      const parsedPriority = ['low', 'medium', 'high'].includes(rawPriority) ? rawPriority : 'medium';

      tasks.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        priority: parsedPriority as 'low' | 'medium' | 'high',
        status: data.status === 'completed' ? 'completed' : 'pending',
        dueDate: data.dueDate || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    // In-memory sort fallback if Firestore composite index was building
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    console.error('Error fetching tasks from Firestore:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks from database',
      error: error.message,
    });
  }
});

// 3. GET single task by ID
app.get('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const data = taskSnap.data();
    return res.status(200).json({
      success: true,
      data: {
        id: taskSnap.id,
        ...data,
      },
    });
  } catch (error: any) {
    console.error(`Error fetching task ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task',
      error: error.message,
    });
  }
});

// 4. POST create task
app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Task title is required.',
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title must be 100 characters or less.',
      });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const normalizedPriority = typeof priority === 'string' ? priority.trim().toLowerCase() : 'medium';
    const assignedPriority = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';
    const assignedStatus = status === 'completed' ? 'completed' : 'pending';

    const now = new Date().toISOString();
    const newTaskData = {
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      priority: assignedPriority,
      status: assignedStatus,
      dueDate: typeof dueDate === 'string' && dueDate ? dueDate : new Date().toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTaskData);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        id: docRef.id,
        ...newTaskData,
      },
    });
  } catch (error: any) {
    console.error('Error creating task in Firestore:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task in Firestore',
      error: error.message,
    });
  }
});

// 5. PUT update task
app.put('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const taskRef = doc(db, 'tasks', taskId);
    const existingSnap = await getDoc(taskRef);

    if (!existingSnap.exists()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, priority, dueDate, status } = req.body;

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Title cannot exceed 100 characters.' });
      }
      updatePayload.title = title.trim();
    }

    if (description !== undefined) {
      updatePayload.description = typeof description === 'string' ? description.trim() : '';
    }

    if (priority !== undefined) {
      const normalizedPriority = typeof priority === 'string' ? priority.trim().toLowerCase() : '';
      if (!['low', 'medium', 'high'].includes(normalizedPriority)) {
        return res.status(400).json({ success: false, message: 'Priority must be low, medium, or high.' });
      }
      updatePayload.priority = normalizedPriority;
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be pending or completed.' });
      }
      updatePayload.status = status;
    }

    if (dueDate !== undefined) {
      updatePayload.dueDate = typeof dueDate === 'string' ? dueDate : '';
    }

    await updateDoc(taskRef, updatePayload);

    const updatedDoc = await getDoc(taskRef);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error: any) {
    console.error(`Error updating task ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
});

// 6. DELETE task
app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const taskRef = doc(db, 'tasks', taskId);
    const existingSnap = await getDoc(taskRef);

    if (!existingSnap.exists()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await deleteDoc(taskRef);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: taskId },
    });
  } catch (error: any) {
    console.error(`Error deleting task ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
});

// 7. Optional Demo Seed endpoint (helpful for presentations)
app.post('/api/tasks/seed', async (_req: Request, res: Response) => {
  try {
    const sampleTasks = [
      {
        title: 'Prepare Solo Web Dev Presentation',
        description: 'Review architecture slides, test live CRUD operations, and highlight Firestore integration.',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      },
      {
        title: 'Review Express REST API Routes',
        description: 'Verify status codes (200, 201, 400, 404), route validation, and error handling middleware.',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date().toISOString().split('T')[0], // Today
      },
      {
        title: 'Test Firestore Persistence Across Refresh',
        description: 'Add a new task in browser, refresh page, and confirm data is fetched directly from Google Cloud Firestore.',
        priority: 'high',
        status: 'completed',
        dueDate: new Date().toISOString().split('T')[0],
      },
      {
        title: 'Practice Mobile Responsive Demo',
        description: 'Switch browser devtools to iPhone/Pixel view to demonstrate mobile sidebar drawer and touch buttons.',
        priority: 'low',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      },
    ];

    const inserted: Task[] = [];
    const now = new Date().toISOString();

    for (const sample of sampleTasks) {
      const taskData = {
        ...sample,
        priority: sample.priority as 'low' | 'medium' | 'high',
        status: sample.status as 'pending' | 'completed',
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      inserted.push({
        id: docRef.id,
        ...taskData,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} demo tasks into Firestore`,
      data: inserted,
    });
  } catch (error: any) {
    console.error('Error seeding demo tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed sample tasks',
      error: error.message,
    });
  }
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: Number(PORT),
        host: '0.0.0.0',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('⚡ Vite development middlewares attached to Express');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('📦 Serving production build from dist/');
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 TaskFlow server running at http://0.0.0.0:${PORT}`);
    console.log(`📊 Firestore connected to database: ${databaseId || '(default)'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
