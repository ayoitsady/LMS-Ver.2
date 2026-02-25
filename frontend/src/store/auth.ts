import { create } from "zustand";



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

interface AuthState {
  allUserData: DecodedToken | null;
  loading: boolean;
  user: () => {
    user_id: number | null;
    username: string | null;
  };
  setUser: (user: DecodedToken | null) => void;
  setLoading: (loading: boolean) => void;
  isLoggedIn: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  allUserData: null,
  loading: false,

  user: () => ({
    user_id: get().allUserData?.user_id || null,
    username: get().allUserData?.username || null,
  }),

  setUser: (user) =>
    set({
      allUserData: user,
    }),

  setLoading: (loading) => set({ loading }),

  isLoggedIn: () => get().allUserData !== null,
}));

if (process.env.NODE_ENV === "development") {
  import("simple-zustand-devtools").then(({ mountStoreDevtool }) => {
    mountStoreDevtool("Store", useAuthStore);
  });
}

export { useAuthStore };
