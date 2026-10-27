const BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const loginUser = (credentials) => fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
}).then(res => res.json());

export const registerUser = (credentials) => fetch(`${BASE_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
}).then(res => res.json());

export const getTasks = () => fetch(`${BASE_URL}/tasks`, { headers: getHeaders() }).then(res => res.json());

export const createTask = (task) => fetch(`${BASE_URL}/tasks`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(task)
}).then(res => res.json());

export const updateTask = (id, task) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify(task)
}).then(res => res.json());

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'DELETE',
  headers: getHeaders()
}).then(res => res.json());

export const getNotifications = () => fetch(`${BASE_URL}/notifications`).then(res => res.json());

export const generateAIDescription = (title) => fetch(`${BASE_URL}/api/ai/generate-description`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title })
}).then(async (res) => {
  const data = await res.json();
  if (!res.ok && res.status !== 429) {
    throw new Error(data.message || 'AI service error');
  }
  return data;
});
