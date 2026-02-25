"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { 
  Users, 
  MapPin, 
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";

interface Student {
  full_name: string;
  image: string;
  country: string;
  date: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(`teacher/student-lists/${UserData()?.teacher_id}/`);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <InstructorHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <InstructorSidebar />
          </div>
          
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <motion.div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Students</h4>
                <p className="text-sm text-gray-500">Manage your enrolled students</p>
              </div>
            </motion.div>
            
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">My Students</CardTitle>
                    <p className="text-sm text-buttonsCustom-500 mt-1">
                      Meet people taking your courses
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buttonsCustom-600" />
                  </div>
                ) : students.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((student, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg overflow-hidden"
                      >
                        <div className="p-6 text-center">
                          <div className="relative h-20 w-20 mx-auto mb-4">
                            <Image
                              src={student.image}
                              alt={student.full_name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <h4 className="font-medium text-lg text-gray-900 mb-1">{student.full_name}</h4>
                          {student.country && (
                            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              <span>{student.country}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                            <span className="text-gray-500">Enrolled</span>
                            <div className="flex items-center text-gray-700">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              {format(new Date(student.date), "dd MMM yyyy")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                    <Users className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No students yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      When students enroll in your courses, they will appear here
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
