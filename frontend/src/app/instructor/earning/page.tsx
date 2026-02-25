"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Users,
  BookOpen
} from "lucide-react";
import Image from "next/image";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total_revenue: number;
  monthly_revenue: number;
  total_courses: number;
  total_students: number;
}

interface MonthlyEarning {
  month: number;
  total_earning: number;
}

interface BestSellingCourse {
  course_id: string;
  course_title: string;
  course_image: string;
  sales: number;
  revenue: number;
}

// Platform fee constant
const PLATFORM_FEE_PERCENT = 20;
const getNetEarning = (amount: number) => amount * (1 - PLATFORM_FEE_PERCENT / 100);

export default function Earning() {
  const [stats, setStats] = useState<Stats>({
    total_revenue: 0,
    monthly_revenue: 0,
    total_courses: 0,
    total_students: 0
  });
  const [earnings, setEarnings] = useState<MonthlyEarning[]>([]);
  const [bestSellingCourses, setBestSellingCourses] = useState<BestSellingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, earningsRes, bestCoursesRes] = await Promise.all([
          useAxios.get(`teacher/summary/${UserData()?.user_id}/`),
          useAxios.get(`teacher/all-months-earning/${UserData()?.user_id}/`),
          useAxios.get(`teacher/best-course-earning/${UserData()?.user_id}/`)
        ]);
        
        setStats(statsRes.data[0] || {
          total_revenue: 0,
          monthly_revenue: 0,
          total_courses: 0,
          total_students: 0
        });
        setEarnings(earningsRes.data || []);
        setBestSellingCourses(bestCoursesRes.data || []);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    }, []);

  const getMonthName = (month: number): string => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1] || "";
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
                <IndianRupee className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Earnings</h4>
                <p className="text-sm text-gray-500">Track your revenue and performance</p>
              </div>
            </motion.div>
            
            {/* Stats Overview */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 overflow-hidden backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-green-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <>₹{stats.total_revenue?.toFixed(2) || "0.00"}</>
                        )}
                      </h3>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>All time earnings</span>
                      </p>
                      {/* Net Earning */}
                      {!isLoading && (
                        <p className="text-xs text-green-700 mt-1">
                          Net after 20% fee: <span className="font-semibold">₹{getNetEarning(stats.total_revenue).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="p-2 bg-green-200/50 rounded-lg">
                      <IndianRupee className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-buttonsCustom-50 to-buttonsCustom-100 border-buttonsCustom-200 overflow-hidden backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-buttonsCustom-700 mb-1">Monthly Revenue</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-buttonsCustom-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <>₹{stats.monthly_revenue?.toFixed(2) || "0.00"}</>
                        )}
                      </h3>
                      <p className="text-xs text-buttonsCustom-600 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Current month</span>
                      </p>
                      {/* Net Earning */}
                      {!isLoading && (
                        <p className="text-xs text-buttonsCustom-700 mt-1">
                          Net after 20% fee: <span className="font-semibold">₹{getNetEarning(stats.monthly_revenue).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="p-2 bg-buttonsCustom-200/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-buttonsCustom-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 overflow-hidden backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Total Courses</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-amber-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          stats.total_courses || 0
                        )}
                      </h3>
                      <p className="text-xs text-amber-600 mt-1 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span>Published courses</span>
                      </p>
                    </div>
                    <div className="p-2 bg-amber-200/50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-amber-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 overflow-hidden backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-rose-700 mb-1">Total Students</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-rose-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          stats.total_students || 0
                        )}
                      </h3>
                      <p className="text-xs text-rose-600 mt-1 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>Enrolled students</span>
                      </p>
                    </div>
                    <div className="p-2 bg-rose-200/50 rounded-lg">
                      <Users className="h-5 w-5 text-rose-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Best Selling Courses */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                {/* Gradient Header */}
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Best Selling Courses</CardTitle>
                      <CardDescription className="text-sm text-buttonsCustom-600">
                        Your top performing courses by revenue
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View All Courses</DropdownMenuItem>
                        <DropdownMenuItem>Export Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-16 w-24 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bestSellingCourses.length > 0 ? (
                    <>
                      {/* Desktop and Tablet View */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-50/50">
                              <TableHead className="w-[50%]">Course</TableHead>
                              <TableHead>Sales</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bestSellingCourses.map((course, index) => (
                              <TableRow key={course.course_id || index} className="hover:bg-gray-50/50">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md relative group">
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 z-10 rounded-md" />
                                      <Image
                                        src={course.course_image}
                                        alt={course.course_title}
                                        width={96}
                                        height={64}
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                      />
                                    </div>
                                    <div className="font-medium text-gray-900">{course.course_title}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {course.sales} students
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-buttonsCustom-700">
                                  ₹{course.revenue.toFixed(2)}
                                  <div className="text-xs text-green-700">Net: ₹{getNetEarning(course.revenue).toFixed(2)}</div>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Mobile View */}
                      <div className="sm:hidden">
                        <div className="divide-y divide-gray-100">
                          {bestSellingCourses.map((course, index) => (
                            <motion.div 
                              key={course.course_id || index} 
                              className="p-4 hover:bg-gray-50/50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md relative">
                                  <Image
                                    src={course.course_image}
                                    alt={course.course_title}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{course.course_title}</h4>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                      {course.sales} students
                                    </Badge>
                                    <div className="text-sm font-semibold text-buttonsCustom-700">
                                      ₹{course.revenue.toFixed(2)}
                                      <div className="text-xs text-green-700">Net: ₹{getNetEarning(course.revenue).toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                      <p className="text-sm text-gray-500 text-center mt-1">
                        When you start selling courses, they will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
                {bestSellingCourses.length > 0 && (
                  <CardFooter className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <Button variant="outline" size="sm" className="ml-auto text-xs">
                      View All Courses
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
            
            {/* Monthly Earnings */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                {/* Gradient Header */}
                <div className="h-2 bg-gradient-to-r from-green-800 to-green-600" />
                <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-green-50/50 to-transparent border-b border-green-100">
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-gray-900">Monthly Earnings</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Your earnings history by month
                      </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100/50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : earnings.length > 0 ? (
                    <>
                      {/* Desktop and Tablet View */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-50/50">
                              <TableHead>Month</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {earnings.map((earning, index) => (
                              <TableRow key={index} className="hover:bg-gray-50/50">
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-green-100/50 flex items-center justify-center mr-3">
                                      <span className="text-xs font-medium text-green-700">{earning.month}</span>
                                    </div>
                                    <span>{getMonthName(earning.month)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-green-700">
                                  ₹{earning.total_earning?.toFixed(2) || "0.00"}
                                  <div className="text-xs text-green-700">Net: ₹{getNetEarning(earning.total_earning).toFixed(2)}</div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Mobile View */}
                      <div className="sm:hidden">
                        <div className="divide-y divide-gray-100">
                          {earnings.map((earning, index) => (
                            <motion.div 
                              key={index} 
                              className="flex justify-between items-center p-4 hover:bg-gray-50/50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-green-100/50 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-green-700">{earning.month}</span>
                                </div>
                                <div className="font-medium text-sm">{getMonthName(earning.month)}</div>
                              </div>
                              <div className="text-sm font-semibold text-green-700">
                                ₹{earning.total_earning?.toFixed(2) || "0.00"}
                                <div className="text-xs text-green-700">Net: ₹{getNetEarning(earning.total_earning).toFixed(2)}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No earnings history</h3>
                      <p className="text-sm text-gray-500 text-center mt-1">
                        Your monthly earnings will appear here once you start making sales
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
