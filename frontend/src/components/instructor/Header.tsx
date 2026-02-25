"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { Settings2 } from "lucide-react";
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
  image?: string;
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

export default function InstructorHeader() {
  const router = useRouter();
  const [, setContextProfile] = useContext(ProfileContext);
  const [localProfile, setLocalProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await useAxios.get(`user/profile/${UserData()?.user_id}/`);
      const imageUrl = res.data.image ? res.data.image : "/default-avatar.png";

      setLocalProfile((prev) => ({
        ...prev!,
        image: imageUrl,
        about: res.data.about || "Welcome to your Instructor dashboard!",
      }));
      setContextProfile((prev) => ({
        ...prev,
        image: imageUrl,
        about: res.data.about || "Welcome to your Instructor dashboard!",
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
          image: decoded.image || "/default-avatar.png",
          about: "Welcome to your Instructor dashboard!",
          country: "",
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
    router.push("/instructor/profile");
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
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 -z-10 blur-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-white shadow-md transform transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={localProfile.image}
                    alt={localProfile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">
                  {localProfile.full_name}
                </h2>
                <p className="text-xs sm:text-sm text-buttonsCustom-600 font-medium flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Instructor Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-buttonsCustom-200 text-buttonsCustom-600 hover:bg-buttonsCustom-50 hover:text-buttonsCustom-700 hover:border-buttonsCustom-300 text-xs sm:text-sm px-3 sm:px-4 rounded-full transition-all duration-200"
              onClick={handleSettingsClick}
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
