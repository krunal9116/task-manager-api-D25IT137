import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask, getNotifications } from '../api';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      // background polling
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
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

      {/* Practical 10: Event-Driven Background Notification Feed */}
      <div style={{ marginTop: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚡ Async Event Stream (Node.js EventEmitter)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
              Background events processed asynchronously after API response is sent to client
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={fetchNotifications}
          >
            Refresh Logs ({notifications.length})
          </button>
        </div>

        {notifications.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '20px' }}>
            No background events emitted yet. Add or delete a task to trigger background listeners!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {notifications.slice().reverse().map(item => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'rgba(0,0,0,0.25)', 
                  borderLeft: `4px solid ${item.event === 'task-created' ? '#10b981' : '#ef4444'}`,
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: item.event === 'task-created' ? '#10b981' : '#ef4444', 
                    marginRight: '8px',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}>
                    {item.event}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>"{item.taskTitle}"</span>
                  <span style={{ color: '#888', marginLeft: '8px' }}>by {item.user}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#aaa' }}>
                  <div>API: {item.apiSentAt ? item.apiSentAt.split('T')[1].replace('Z','') : 'Immediate'}</div>
                  <div style={{ color: '#10b981' }}>Processed: {item.processedAt ? item.processedAt.split('T')[1].replace('Z','') : 'Done'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
    </section>
  );
}
