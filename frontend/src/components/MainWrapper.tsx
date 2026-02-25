"use client";

import { useEffect } from "react";
import { setUser } from "../utils/auth";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";

interface MainWrapperProps {
  children: React.ReactNode;
}

const MainWrapper = ({ children }: MainWrapperProps) => {
  const { loading, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setUser();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MainWrapper;