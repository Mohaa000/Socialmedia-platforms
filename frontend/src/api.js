const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('campuslink_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  feed: () => request('/posts', { auth: !!getToken() }),
  createPost: (content) => request('/posts', { method: 'POST', body: { content } }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
  unlike: (id) => request(`/posts/${id}/like`, { method: 'DELETE' }),
  comments: (id) => request(`/posts/${id}/comments`, { auth: false }),
  addComment: (id, content) => request(`/posts/${id}/comments`, { method: 'POST', body: { content } }),

  profile: (username) => request(`/users/${username}`, { auth: !!getToken() }),
  updateProfile: (payload) => request('/users/me', { method: 'PUT', body: payload }),
  follow: (username) => request(`/users/${username}/follow`, { method: 'POST' }),
  unfollow: (username) => request(`/users/${username}/follow`, { method: 'DELETE' }),
};

export { getToken };
