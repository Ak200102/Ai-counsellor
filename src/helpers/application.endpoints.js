import api from "./api.js";

export const applicationEndpoints = {
  // Get all applications for the user
  getApplications: () => api.get("/api/applications"),
  
  // Get application statistics
  getApplicationStats: () => api.get("/api/applications/stats"),
  
  // Get a single application by ID
  getApplicationById: (id) => api.get(`/api/applications/${id}`),
  
  // Create a new application
  createApplication: (data) => api.post("/api/applications", data),
  
  // Update an application
  updateApplication: (id, data) => api.put(`/api/applications/${id}`, data),
  
  // Submit an application
  submitApplication: (id) => api.post(`/api/applications/${id}/submit`),
  
  // Delete an application
  deleteApplication: (id) => api.delete(`/api/applications/${id}`),
  
  // Upload a document to an application
  uploadDocument: (id, formData) => {
    return api.post(`/api/applications/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete a document from an application
  deleteDocument: (id, documentId) => api.delete(`/api/applications/${id}/documents/${documentId}`)
};

export default applicationEndpoints;
