// api.js
// Central place for all backend calls. Put this next to App.jsx (src/api.js).

const API_URL = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const body = await res.json();
      // FastAPI validation errors come back as an array; flatten to a string.
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        detail = body.detail.map((e) => e.msg).join(", ");
      }
    } catch {
      // response had no JSON body
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Decode the JWT payload client-side so we know the user's role after login.
export function decodeToken(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const api = {
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getPatients: () => request("/patients"),

  searchPatients: ({ name, phone, passport } = {}) => {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (phone) params.append("phone", phone);
    if (passport) params.append("passport", passport);
    return request(`/patients/search?${params.toString()}`);
  },

  getPatient: (id) => request(`/patients/${id}`),

  createPatient: (data) =>
    request("/patients", { method: "POST", body: JSON.stringify(data) }),

  getVaccinations: (patientId) =>
    request(`/patients/${patientId}/vaccinations`),

  createVaccination: (data) =>
    request("/vaccinations", { method: "POST", body: JSON.stringify(data) }),
};
