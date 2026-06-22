const API = "http://localhost:3001";

export const apiFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};


// 👇 para login/register (sin token)
export const apiPublicFetch = async (url: string, options: any = {}) => {
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};