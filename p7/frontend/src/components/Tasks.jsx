import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        if (response.message && response.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    
    const newTask = { title, description, completed: false, priority: 'medium' };
    
    // Optimistic Update
    const tempId = Date.now().toString();
    setTasks([{ _id: tempId, ...newTask, isOptimistic: true }, ...tasks]);
    setTitle('');
    setDescription('');

    try {
      const response = await createTask(newTask);
      if (response.success) {
        setTasks(prev => prev.map(t => t._id === tempId ? response.data : t));
        showToast('Task created successfully', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== tempId));
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleToggle = async (task) => {
    try {
      const response = await updateTask(task._id, { completed: !task.completed });
      if (response.success) {
        setTasks(prev => prev.map(t => t._id === task._id ? response.data : t));
        showToast('Task updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const response = await deleteTask(id);
      if (response.success) {
        setTasks(prev => prev.filter(t => t._id !== id));
        showToast('Task deleted successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  return (
    <section className="projects-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title">Task Management</h2>
      </div>

      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto 30px' }}>
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          className="search-input"
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          className="search-input"
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '12px', width: '100%' }}>Add Task</button>
      </form>

      {loading && <Spinner message="Fetching tasks from backend..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={fetchTasks} />}

      {!loading && !error && (
        <div className="projects-grid">
          {tasks.map(task => (
            <div key={task._id} className={`project-card ${task.isOptimistic ? 'optimistic' : ''}`} style={{ opacity: task.isOptimistic ? 0.6 : 1 }}>
              <div className="project-body">
                <h3 className="project-title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
                <p className="project-desc">{task.description}</p>
              </div>
              <div className="project-footer" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.9rem' }} onClick={() => handleToggle(task)}>
                  {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button className="btn btn-secondary" onClick={() => handleDelete(task._id)} style={{ flex: 1, fontSize: '0.9rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
    </section>
  );
}
