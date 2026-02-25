"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  IndianRupee,
  Search,
  Edit,
  Trash,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";

interface Stats {
  total_courses: number;
  total_students: number;
  total_revenue: number;
}

interface Student {
  id: string;
  name: string;
}

interface Course {
  id: string;
  course_id: string;
  slug?: string; // Add the slug property
  title: string;
  image: string;
  language: string;
  level: string;
  price: number;
  students: Student[];
  date: string;
  platform_status: "Review" | "Reject" | "Disabled" | "Draft" | "Published";
  teacher_course_status: "Disabled" | "Draft" | "Published";
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_courses: 0,
    total_students: 0,
    total_revenue: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.all([
        useAxios.get(`teacher/summary/${UserData()?.teacher_id}/`),
        useAxios.get(`teacher/course-lists/${UserData()?.teacher_id}/`),
      ]);
      setStats(statsRes.data[0]);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteClick = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;

    setIsDeleting(true);
    try {
      // Make the delete API call using the slug
      await useAxios.delete(`course/course-detail/${deletingCourse.slug}/`);

      // Remove the course from the state
      setCourses(
        courses.filter(
          (course) => course.course_id !== deletingCourse.course_id
        )
      );

      // Show success message
      Toast().fire({
        title: `Course "${deletingCourse.title}" deleted successfully`,
        icon: "success",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      Toast().fire({
        title: "Failed to delete course",
        icon: "error",
      });
    } finally {
      // Reset state
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingCourse(null);
    }
  };
  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      fetchCourseData();
    } else {
      const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setCourses(filtered);
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

          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <motion.div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Dashboard</h4>
                <p className="text-sm text-gray-500">
                  Manage your courses and view insights
                </p>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-amber-100 rounded-lg">
                      <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600">
                        Total Courses
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-amber-700">
                        {stats.total_courses}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-rose-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-600">
                        Total Students
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-rose-700">
                        {stats.total_students}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 backdrop-blur-sm border border-white/20 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Total Revenue
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-green-700">
                        ₹{stats.total_revenue?.toFixed(2)}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">
                      Courses
                    </CardTitle>
                    <p className="text-sm text-buttonsCustom-500 mt-1">
                      Manage your courses from here, search, view, edit or
                      delete courses.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
                    <Input
                      type="search"
                      placeholder="Search your courses..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-10 border-buttonsCustom-200 focus:border-buttonsCustom-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buttonsCustom-600" />
                  </div>
                ) : courses.length > 0 ? (
                  <div>
                    {/* Desktop and Tablet View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left">Courses</th>
                            <th className="px-6 py-3 text-left">Enrolled</th>
                            <th className="px-6 py-3 text-left">Level</th>
                            <th className="px-6 py-3 text-left">
                              Platform Status
                            </th>
                            <th className="px-6 py-3 text-left">
                              Course Status
                            </th>
                            <th className="px-6 py-3 text-left">
                              Date Created
                            </th>
                            <th className="px-6 py-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {courses.map((course) => (
                            <motion.tr
                              key={course.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-white hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                    <Image
                                      src={course.image}
                                      alt={course.title}
                                      width={96}
                                      height={64}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {course.title}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                      <span>{course.language}</span>
                                      <span>•</span>
                                      <span>{course.level}</span>
                                      <span>•</span>
                                      <span>₹{course.price}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {course.students?.length || 0}
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 border-green-200"
                                >
                                  {course.level}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    course.platform_status === "Published"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : course.platform_status === "Review"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : course.platform_status === "Draft"
                                      ? "bg-gray-100 text-gray-800 border-gray-200"
                                      : course.platform_status === "Reject"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-amber-100 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {course.platform_status || "Unknown"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    course.teacher_course_status === "Published"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : course.teacher_course_status === "Draft"
                                      ? "bg-gray-100 text-gray-800 border-gray-200"
                                      : "bg-amber-100 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {course.teacher_course_status || "Unknown"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {format(new Date(course.date), "dd MMM, yyyy")}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-buttonsCustom-600"
                                    asChild
                                  >
                                    <Link
                                      href={`/instructor/edit-course/${course.course_id}/`}
                                    >
                                      <Edit className="h-3.5 w-3.5 mr-1" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-red-600"
                                    onClick={() => handleDeleteClick(course)}
                                  >
                                    <Trash className="h-3.5 w-3.5 mr-1" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="sm:hidden">
                      {courses.map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-4 mb-3 rounded-lg"
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                              <Image
                                src={course.image}
                                alt={course.title}
                                width={96}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                <span>{course.language}</span>
                                <span>•</span>
                                <span>{course.level}</span>
                                <span>•</span>
                                <span>₹{course.price}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                              <span className="text-gray-500 block">
                                Enrolled:
                              </span>
                              <span className="font-medium">
                                {course.students?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Date:</span>
                              <span className="font-medium">
                                {format(new Date(course.date), "dd MMM, yyyy")}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <div>
                              <span className="text-gray-500 text-xs block mb-1">
                                Platform:
                              </span>
                              <Badge
                                variant="outline"
                                className={`${
                                  course.platform_status === "Published"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : course.platform_status === "Review"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : course.platform_status === "Draft"
                                    ? "bg-gray-100 text-gray-800 border-gray-200"
                                    : course.platform_status === "Reject"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-amber-100 text-amber-800 border-amber-200"
                                }`}
                              >
                                {course.platform_status || "Unknown"}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs block mb-1">
                                Status:
                              </span>
                              <Badge
                                variant="outline"
                                className={`${
                                  course.teacher_course_status === "Published"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : course.teacher_course_status === "Draft"
                                    ? "bg-gray-100 text-gray-800 border-gray-200"
                                    : "bg-amber-100 text-amber-800 border-amber-200"
                                }`}
                              >
                                {course.teacher_course_status || "Unknown"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-buttonsCustom-600"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-red-600"
                            >
                              <Trash className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No courses found
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first course to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{deletingCourse?.title}</span>?
              <p className="mt-2 text-red-500">
                This action cannot be undone. All course content, lectures, and
                materials will be permanently removed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
