import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('selectedTenantId');
  if (tenantId) {
    config.params = {
      ...config.params,
      tenant_id: tenantId,
      tenant: tenantId, 
    };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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
  try{
    const res = await apiClient.get("/loads", { params });
    return res.data;
  }catch(error){
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

export const getExceptions = async () => {
  const tenantId = localStorage.getItem('selectedTenantId');
  const res = await apiClient.get("/loads", { 
    params: { 
      tenant: tenantId,
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

export const transitionLoad = (loadId, newState) => {
  return apiClient.post(`/loads/${loadId}/transition`, {
    new_state: newState,
  });
};

export const triggerOrchestration = async (tenantSlug) => {
  const res = await apiClient.post("/runs/trigger", {
    tenant_slug: tenantSlug,
    dispath_file: "",  // Empty as per user request
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
  const res = await apiClient.post("/ingest/inovice", formData, { // Backend has a typo 'inovice'
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const ingestDocument = async (file, docType, loadId) => {
  const tenantId = localStorage.getItem('selectedTenantId');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tenant_id', tenantId);
  formData.append('doc_type', docType);
  if (loadId) formData.append('load_id', loadId);

  const res = await apiClient.post("/ingest/document", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      load_id: loadId // Some backends might want it here too
    }
  });
  return res.data;
};

export default apiClient;