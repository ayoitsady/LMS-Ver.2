"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LockKeyhole, 
  Save, 
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form schema with validation
const passwordFormSchema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_new_password: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords do not match",
  path: ["confirm_new_password"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ChangePassword() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formdata = new FormData();
      formdata.append("user_id", String(UserData()?.user_id || ""));
      formdata.append("old_password", values.old_password);
      formdata.append("new_password", values.new_password);
      
      const response = await useAxios.post(`user/change-password/`, formdata);
      
      Toast().fire({
        icon: response.data.icon || "success",
        title: response.data.message || "Password changed successfully",
      });
      
      // Reset form on success
      if (response.data.icon === "success") {
        form.reset();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <InstructorHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <InstructorSidebar />
          </div>
          
          <div className="lg:col-span-3 space-y-5 sm:space-y-7">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                <LockKeyhole className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                {/* Gradient Header */}
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-buttonsCustom-600" />
                    Password Security
                  </CardTitle>
                  <CardDescription className="text-buttonsCustom-500 mt-1">
                    Choose a strong password to secure your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="old_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showOldPassword ? "text" : "password"}
                                  placeholder="Enter your current password"
                                  className="pr-10 border-gray-200 focus-visible:ring-buttonsCustom-500"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowOldPassword(!showOldPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showOldPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="new_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter your new password"
                                  className="pr-10 border-gray-200 focus-visible:ring-buttonsCustom-500"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirm_new_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your new password"
                                  className="pr-10 border-gray-200 focus-visible:ring-buttonsCustom-500"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white"
                          disabled={isSubmitting}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Saving..." : "Save New Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
