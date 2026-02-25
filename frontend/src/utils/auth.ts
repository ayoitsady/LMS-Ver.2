import { useAuthStore } from "../store/auth";
import axios from "./axios";
import {jwtDecode} from "jwt-decode";
import Cookie from "js-cookie";
import { AxiosError } from "axios";
import toast from 'react-hot-toast';

interface LoginResponse {
  data: {
    access: string;
    refresh: string;
  } | null;
  error: string | null;
}

interface RegisterResponse {
  data: {
    full_name: string;
    email: string;
  } | null;
  error: string | null;
}

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  teacher_id: number;
  wallet_address: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data, status } = await axios.post(`user/token/`, {
      email,
      password,
    });

    
    if (status === 200) {
      setAuthUser(data.access, data.refresh);
    }

    return { data, error: null };
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.code === 'ERR_BLOCKED_BY_CLIENT') {
      toast.error(
        'Request blocked. Please disable adblockers or try Google Chrome/Firefox.',
        {
          duration: 6000,
          position: 'bottom-center'
        }
      );
    }
    
    const errorMessage = error instanceof AxiosError 
      ? error.response?.data?.detail || "Something went wrong"
      : "An unexpected error occurred";
    
    return { data: null, error: errorMessage };
  }
};

export const register = async (
  full_name: string,
  email: string,
  password: string,
  password2: string,
  wallet_address: string
): Promise<RegisterResponse> => {
  try {
    const { data } = await axios.post(`user/register/`, {
      full_name,
      email,
      password,
      password2,
      wallet_address,
    });

    await login(email, password);
    return { data, error: null };
  } catch (error: unknown) {
    let errorMessage = "Something went wrong";
    if (error instanceof AxiosError && error.response?.data) {
      const errors: string[] = [];
      if (error.response.data.full_name) {
        errors.push(error.response.data.full_name);
      }
      if (error.response.data.email) {
        errors.push(error.response.data.email);
      }
      if (errors.length > 0) {
        errorMessage = errors.join(' - ');
      }
    }
    return {
      data: null,
      error: errorMessage
    };
  }
};

export const logout = (): void => {
  Cookie.remove("access_token");
  Cookie.remove("refresh_token");
  const { setUser } = useAuthStore.getState() as { setUser: (user: DecodedToken | null) => void };
  setUser(null);
};

export const setUser = async (): Promise<void> => {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (!access_token || !refresh_token) {
    return;
  }

  if (isAccessTokenExpired(access_token)) {
    const response = await getRefreshToken(refresh_token);
    setAuthUser(response.data.access, response.data.refresh);
  } else {
    setAuthUser(access_token, refresh_token);
  }
};

export const setAuthUser = (access_token: string, refresh_token: string) => {
  Cookie.set("access_token", access_token, { expires: 1 });
  Cookie.set("refresh_token", refresh_token, { expires: 7 }); 

  try {
    const decoded = jwtDecode<DecodedToken>(access_token);
    useAuthStore.getState().setUser(decoded);
  } catch (error) {
    console.error("Error decoding token:", error);
    logout();
  }
};

export const getRefreshToken = async (refresh_token?: string) => {
  try {
    const token = refresh_token || Cookie.get("refresh_token");
    const response = await axios.post(`user/token/refresh/`, {
      refresh: token,
    });
    return response;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    logout();
    throw error;
  }
};

export const isAccessTokenExpired = (access_token: string): boolean => {
  try {
    const decodedToken = jwtDecode<DecodedToken>(access_token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};
