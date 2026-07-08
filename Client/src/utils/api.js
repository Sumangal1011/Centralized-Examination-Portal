const BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to fetch with JWT token and content headers
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authAPI = {
  login: (uid, password, role) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ uid, password, role }),
    }),
  register: (uid, name, password, role, photoLink = '') =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ uid, name, password, role, photoLink }),
    }),
  me: () => apiRequest('/auth/me'),
};

export const examAPI = {
  create: (title, subject, duration, questions) =>
    apiRequest('/exam/create', {
      method: 'POST',
      body: JSON.stringify({ title, subject, duration, questions }),
    }),
  list: () => apiRequest('/exam/list'),
  getById: (id) => apiRequest(`/exam/${id}`),
  updateStatus: (id, status) =>
    apiRequest(`/exam/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const submissionAPI = {
  submit: (examId, answers, status = 'submitted') =>
    apiRequest('/submission/submit', {
      method: 'POST',
      body: JSON.stringify({ examId, answers, status }),
    }),
  list: () => apiRequest('/submission/list'),
  getMySubmissions: () => apiRequest('/submission/my-submissions'),
  getReview: (examId) => apiRequest(`/submission/review/${examId}`),
  checkSubmission: (examId) => apiRequest(`/submission/check/${examId}`),
  getExamSubmissions: (examId) => apiRequest(`/submission/exam/${examId}`),
};

export const incidentAPI = {
  report: (reportData) =>
    apiRequest('/incident/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  list: () => apiRequest('/incident/list'),
  getById: (id) => apiRequest(`/incident/${id}`),
  updateStatus: (id, status) =>
    apiRequest(`/incident/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
