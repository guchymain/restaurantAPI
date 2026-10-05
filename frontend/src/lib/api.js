import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach JWT Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("restaurant_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear token if invalid or expired
      const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("restaurant_token");
        localStorage.removeItem("restaurant_user");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  login: async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  register: async ({ name, email, phone, password, role = "customer" }) => {
    const res = await api.post("/auth/register", { name, email, phone, password, role });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

// User Profile Endpoints
export const usersAPI = {
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

// Categories Endpoints
export const categoriesAPI = {
  getAll: async () => {
    const res = await api.get("/categories");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/categories", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

// Menu Items Endpoints
export const menuItemsAPI = {
  getAll: async (params = {}) => {
    const res = await api.get("/menu-items", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/menu-items/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/menu-items", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/menu-items/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/menu-items/${id}`);
    return res.data;
  },
};

// Orders Endpoints
export const ordersAPI = {
  getAll: async (params = {}) => {
    const res = await api.get("/orders", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  create: async ({ items, userId }) => {
    const payload = { items };
    if (userId) payload.userId = userId;
    const res = await api.post("/orders", payload);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/orders/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },
};

export default api;
