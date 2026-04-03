const API_BASE = process.env.REACT_APP_API_URL || 'https://fnexus.onrender.com/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Contacts
  searchContacts: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/contacts/search?${query}`);
  },
  getContact: (id) => request(`/contacts/${id}`),
  createContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  bulkDelete: (ids) => request('/contacts/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload', { method: 'POST', body: formData });
  },
  getUploadHistory: () => request('/upload/history'),

  // Analytics
  getOverview: () => request('/analytics/overview'),
  getByCity: () => request('/analytics/by-city'),
  getByCompany: () => request('/analytics/by-company'),
  getBySource: () => request('/analytics/by-source'),
  getPlatformCoverage: () => request('/analytics/platform-coverage'),
  getGrowth: () => request('/analytics/growth'),
};
