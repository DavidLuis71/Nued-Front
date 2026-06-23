import { supabase } from "../lib/supabase";

const API = "http://localhost:3001";

// 🔒 requests con auth
export const apiFetch = async (url: string, options: any = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// 🔓 requests públicas
export const apiPublicFetch = async (url: string, options: any = {}) => {
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};