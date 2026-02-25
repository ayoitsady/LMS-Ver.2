"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { Settings2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import { ProfileContext } from "@/views/plugins/Context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
}

interface ProfileData {
  id: number;
  name?: string;
  email: string;
  teacher_id: number;
  image: string;
  full_name: string;
  about: string;
  username: string;
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  country: string;
}

export default function StudentHeader() {
  const router = useRouter();
  const [, setContextProfile] = useContext(ProfileContext);
  const [localProfile, setLocalProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await useAxios.get(`user/profile/${UserData()?.user_id}/`);
      setLocalProfile(prev => ({
        ...prev!,
        image: res.data.image || "/default-avatar.png",
        about: res.data.about || "Welcome to your student dashboard!"
      }));
      setContextProfile(prev => ({
        ...prev,
        image: res.data.image || "/default-avatar.png",
        about: res.data.about || "Welcome to your student dashboard!"
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [setContextProfile]);

  useEffect(() => {
    const access_token = Cookie.get("access_token");
    const refresh_token = Cookie.get("refresh_token");

    if (access_token && refresh_token) {
      try {
        const decoded = jwtDecode<DecodedToken>(refresh_token);
        
        const updatedProfile: ProfileData = {
          id: decoded.user_id,
          full_name: decoded.full_name,
          email: decoded.email,
          teacher_id: decoded.teacher_id,
          username: decoded.username,
          token_type: decoded.token_type,
          exp: decoded.exp,
          iat: decoded.iat,
          jti: decoded.jti,
          image: "/default-avatar.png",
          about: "Welcome to your student dashboard!",
          country: ""
        };
        
        setLocalProfile(updatedProfile);
        setContextProfile(updatedProfile);
        setIsLoading(false);
        fetchProfile(); // Fetch profile data after initial setup
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoading(false);
      }
    } else {
      console.log("No tokens found in cookies");
      setIsLoading(false);
    }
  }, [setContextProfile, fetchProfile]);

  const handleSettingsClick = () => {
    router.push("/student/profile");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buttonsCustom-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!localProfile) {
    return null;
  }

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 -z-10 blur-sm" />
                <Image
                  src={localProfile.image}
                  alt={localProfile.full_name}
                  width={40}
                  height={40}
                  className={cn(
                    "rounded-full border-2 border-white",
                    "object-cover shadow-sm",
                    "transition-transform duration-300 hover:scale-105",
                    "w-10 h-10 sm:w-12 sm:h-12"
                  )}
                />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {localProfile.full_name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Student Dashboard
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-buttonsCustom-600 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => router.push("/student/courses")}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              My Courses
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-buttonsCustom-200 text-buttonsCustom-600 hover:bg-buttonsCustom-50 text-xs sm:text-sm px-2 sm:px-3"
              onClick={handleSettingsClick}
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
