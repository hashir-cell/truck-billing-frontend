import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://rena-coincident-inviolately.ngrok-free.dev/api/v1',
  // baseURL: 'http://127.0.0.1:8000/api/v1',
   headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",

  },
  credentials: "include",
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already on the login page or if it's the login request itself
      const isLoginRequest = error.config.url.endsWith('/login');
      const isOnLoginPage = window.location.pathname.endsWith('/login');

      if (!isLoginRequest) {
        // Clear stale auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        if (!isOnLoginPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getDashboardSummary = async (params) => {
  try{
      const res = await apiClient.get("/dashboard/summary", { params });
      return res.data;
  }catch(error){
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

export const getLoads = async (params) => {
  try {
    // params can include: page, page_size, state, search, etc.
    const res = await apiClient.get("/loads", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching loads:", error);
    throw error;
  }
};

export const getLoad = async (loadId) => {
  try {
    const res = await apiClient.get(`/loads/${loadId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching load ${loadId}:`, error);
    throw error;
  }
};

export const getExceptions = async (params) => {
  const res = await apiClient.get("/loads", { 
    params: { 
      ...params,
      state: 'EXCEPTION' 
    } 
  });
  return res.data;
};

export const resolveException = async (loadId, resolution, targetState = 'RESOLVED') => {
  const res = await apiClient.post(`/loads/${loadId}/transition`, {
    new_state: targetState,
    reason: resolution
  });
  return res.data;
};

export const getTenants = async (params) => {
  const res = await apiClient.get("/tenants", { params });
  return res.data;
};

export const createTenant = async (data) => {
  const res = await apiClient.post("/tenants", data);
  return res.data;
};

export const updateTenant = async (tenantId, data) => {
  const res = await apiClient.patch(`/tenant/${tenantId}`, data);
  return res.data;
};

export const deleteTenant = async (tenantId) => {
  const res = await apiClient.delete(`/tenant/${tenantId}`);
  return res.data;
};

export const updateLoad = async (loadId, data) => {
  const res = await apiClient.patch(`/load/${loadId}`, data);
  return res.data;
};

export const deleteLoad = async (loadId) => {
  const res = await apiClient.delete(`/loads/${loadId}`);
  return res.data;
};


export const transitionLoad = (loadId, newState) => {
  return apiClient.post(`/loads/${loadId}/transition`, {
    new_state: newState,
  });
};

export const triggerOrchestration = async (tenantSlug) => {
  const res = await apiClient.post("/runs/trigger", {
    tenant_slug: tenantSlug,
    dispatch_file: "",  // Empty as per user request
    invoice_file: "",
    bank_statement_file: "",
    document_files: []
  });
  return res.data;
};

export const getRunStatus = async (runId) => {
  const res = await apiClient.get(`/runs/${runId}`);
  return res.data;
};

export const ingestDispatch = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post("/ingest/dispatch", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const ingestInvoice = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post("/ingest/invoice", formData, { 
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const ingestDocument = async (file, docType, loadId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);
  if (loadId) formData.append('load_id', loadId);

  const res = await apiClient.post("/ingest/document", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      load_id: loadId
    }
  });
  return res.data;
};

export const assembleBatch = async (limit = 10) => {
  const res = await apiClient.post("/batches/assemble", null, {
    params: { limit }
  });
  return res.data;
};

// -- Notifications --
export const getNotifications = async (params) => {
  // params: tenant_id, load_id, unread_only
  const res = await apiClient.get("/notifications", { params });
  return res.data;
};

export const markNotificationRead = async (notificationId) => {
  const res = await apiClient.patch(`/notifications/${notificationId}`, { is_read: true });
  return res.data;
};

export const retryNotification = async (notificationId) => {
  const res = await apiClient.post(`/notifications/${notificationId}/retry`);
  return res.data;
};

// -- Gmail OAuth --
export const getGmailConnectUrl = async () => {
  const res = await apiClient.get('/auth/gmail/connect');
  return res.data;
};

export const getGmailStatus = async () => {
  const res = await apiClient.get('/auth/gmail/status');
  return res.data;
};

export const disconnectGmail = async () => {
  const res = await apiClient.delete('/auth/gmail/disconnect');
  return res.data;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post("/branding/logo", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getBatches = async () => {
    const res = await apiClient.get('/batches');
    return res.data;
};

export const postBatchPayment = async (batchId, data) => {
    const res = await apiClient.patch(`/batches/${batchId}/pay`, data);
    return res.data;
};

export const updateBrandingSettings = async (data) => {
  const res = await apiClient.patch("/branding/settings", data);
  return res.data;
};


export const publicUploadDocument = async (token, file, docType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const res = await axios.post(`${apiClient.defaults.baseURL}/public/upload/${token}/document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getPublicLoadDetails = async (token) => {
  const res = await axios.get(`${apiClient.defaults.baseURL}/public/load/${token}`);
  return res.data;
};

export const addPublicLoadNote = async (token, noteData) => {
  const res = await axios.post(`${apiClient.defaults.baseURL}/public/load/${token}/notes`, noteData);
  return res.data;
};

export default apiClient;