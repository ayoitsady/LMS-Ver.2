"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Bell, 
  Check, 
  Clock,
  Calendar,
  AlertCircle,
  XCircle
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";

interface Notification {
  id: string;
  type: string;
  date: string;
  seen: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(`teacher/noti-list/${UserData()?.teacher_id}/`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
    };

    useEffect(() => {
    fetchNotifications();
    }, []);

  const handleMarkAsSeen = async (notificationId: string) => {
        const formdata = new FormData();
    formdata.append("teacher", String(UserData()?.teacher_id || ""));
    formdata.append("pk", notificationId);
    formdata.append("seen", "true");

    try {
      await useAxios.patch(`teacher/noti-detail/${UserData()?.teacher_id}/${notificationId}`, formdata);
      fetchNotifications();
            Toast().fire({
                icon: "success",
        title: "Notification marked as seen",
            });
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to update notification",
      });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "course":
        return <Bell className="h-5 w-5 text-buttonsCustom-600" />;
      case "order":
        return <Clock className="h-5 w-5 text-green-600" />;
      case "review":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-buttonsCustom-600" />;
    }
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
                <Bell className="h-5 w-5 text-buttonsCustom-600" />
                                    </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500">Manage all your notifications from here</p>
                                </div>
            </motion.div>
            
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Your Notifications</CardTitle>
                    <CardDescription className="text-buttonsCustom-500 mt-1">
                      Stay updated with important alerts and messages
                    </CardDescription>
                                                            </div>
                                                        </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-3 flex-1">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-end">
                              <Skeleton className="h-9 w-32" />
                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/50 hover:bg-white/80 transition-colors duration-200 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-buttonsCustom-50 flex items-center justify-center flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">{notification.type}</h3>
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 w-fit">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                  {format(new Date(notification.date), "dd MMM, yyyy")}
                                </Badge>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  onClick={() => handleMarkAsSeen(notification.id)}
                                  variant="outline" 
                                  className="border-buttonsCustom-200 text-buttonsCustom-700 hover:bg-buttonsCustom-50"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Seen
                                </Button>
                                </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                    <div className="bg-gray-50/80 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      You don&apos;t have any notifications at the moment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
                            </div>
                        </div>
                    </div>
                </div>
    );
}
