import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds to accommodate Gemini impact analysis calls if needed
});

// Response interceptor for clean error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.detail || error.message || 'An unexpected API error occurred',
      status: error.response?.status,
      originalError: error,
    };
    return Promise.reject(customError);
  }
);

/**
 * Health check endpoint
 */
export const getHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

/**
 * Fetch all stories (non-duplicate by default)
 */
export const getStories = async (params = {}) => {
  const response = await apiClient.get('/api/stories', { params });
  return response.data;
};

/**
 * Fetch a single story by ID
 */
export const getStory = async (storyId) => {
  const response = await apiClient.get(`/api/stories/${storyId}`);
  return response.data;
};

/**
 * Fetch all registered projects
 */
export const getProjects = async () => {
  const response = await apiClient.get('/api/projects');
  return response.data;
};

/**
 * Fetch a single project by ID
 */
export const getProject = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}`);
  return response.data;
};

/**
 * Create a new project
 * @param {Object} projectData 
 * {
 *   name, description, frontend, backend, database, infrastructure, ai_stack, technologies, topics
 * }
 */
export const createProject = async (projectData) => {
  const response = await apiClient.post('/api/projects', projectData);
  return response.data;
};

/**
 * Get existing impact analyses for a project
 */
export const getProjectImpact = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/impact`);
  return response.data;
};

/**
 * Analyze impact of a specific story on a project using backend Gemini service
 */
export const analyzeImpact = async (projectId, storyId) => {
  const response = await apiClient.post(`/api/projects/${projectId}/impact/analyze/${storyId}`);
  return response.data;
};

/**
 * Fetch RSS/Atom sources
 */
export const getSources = async () => {
  const response = await apiClient.get('/api/sources');
  return response.data;
};

/**
 * Send voice or typed natural language query to FastAPI intelligence backend
 */
export const voiceQuery = async (query, projectId = null, storyId = null) => {
  const response = await apiClient.post('/api/voice/query', {
    query,
    project_id: projectId ? parseInt(projectId) : null,
    story_id: storyId ? parseInt(storyId) : null,
  });
  return response.data;
};

/**
 * Trigger backend RSS collection & intelligence analysis pipeline
 */
export const runPipeline = async (maxStories = 10) => {
  const response = await apiClient.post(`/api/admin/pipeline?max_ai_stories=${maxStories}`);
  return response.data;
};

export default apiClient;
