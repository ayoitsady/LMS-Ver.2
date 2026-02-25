"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  ArrowRight,
  Languages,
  BarChart3,
  Star,
  Calendar,
  BookOpenCheck,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import apiInstance from "@/utils/axios";
import { MINT_API_BASE_URL } from "@/utils/constants";

import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";

interface CompletedLesson {
  id: number;
  lecture_id: number;
}

interface Course {
  enrollment_id: string;
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    price: number;
    image: string;
    file?: string;
    category: { title: string };
    average_rating?: number;
    level: string;
    language: string;
    teacher: {
      image: string;
      full_name: string;
      bio: string;
      twitter: string;
      facebook: string;
      linkedin: string;
      about: string;
    };
  };
  date: string;
  completed_lesson: CompletedLesson[];
  curriculum: {
    variant_id: number;
    title: string;
    content_duration: string;
    variant_items: {
      title: string;
      preview: boolean;
      duration: string;
    }[];
  }[];
}

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [nftStatus, setNftStatus] = useState<Record<string, 'minted' | 'not_minted' | 'minting'>>({});
  const [mintAttempted, setMintAttempted] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(
        `student/course-list/${UserData()?.user_id}/`
      );
      setCourses(response.data);
      setFilteredCourses(response.data);
      // Batch check NFT status for each course only once
      const checks = await Promise.all(
        response.data.map(async (course: Course) => {
          try {
            const res = await apiInstance.get(`nft/asset-id/${course.enrollment_id}/`);
            if (res.data.asset_id) {
              return [course.enrollment_id, 'minted'] as const;
            }
          } catch {}
          return [course.enrollment_id, 'not_minted'] as const;
        })
      );
      // Build the status object
      const statusObj: Record<string, 'minted' | 'not_minted'> = {};
      checks.forEach(([enrollment_id, status]) => {
        statusObj[enrollment_id] = status;
      });
      setNftStatus(statusObj);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterCourses = (query: string) => {
    if (query === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.course.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterCourses(query);
  };

  const handleMintNFT = async (course: Course) => {
    if (nftStatus[course.enrollment_id] === 'minting' || nftStatus[course.enrollment_id] === 'minted' || mintAttempted[course.enrollment_id]) return;
    setNftStatus((prev) => ({ ...prev, [course.enrollment_id]: 'minting' }));
    setMintAttempted((prev) => ({ ...prev, [course.enrollment_id]: true }));
    try {
      const courseDetailsResponse = await apiInstance.get(
        `student/course-detail/${UserData()?.user_id}/${course.enrollment_id}/`
      ); 

      const mintRequestData = {

        courseId: String(courseDetailsResponse.data.course.course_id),
        userId: String(UserData()?.user_id),
        enrollmentId: String(courseDetailsResponse.data.enrollment_id),
        destinationAddress: courseDetailsResponse.data.user.wallet_address,
        image: courseDetailsResponse.data.course.image,
        prefix: courseDetailsResponse.data.course.slug
      };

      
      const mintResponse = await axios.post(`${MINT_API_BASE_URL}api/mint`, JSON.stringify(mintRequestData), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      const backendRequestData = {
        enrollment_id: mintResponse.data.enrollmentId || course.enrollment_id,
        policy_id: mintResponse.data.policyId || "",
        asset_id: mintResponse.data.assetId || "",
        asset_name: mintResponse.data.assetName || "",
        tx_hash: mintResponse.data.txHash || "",
        image: mintResponse.data.image || courseDetailsResponse.data.course.image
      };
      try {
        await apiInstance.post('nft/mint/', backendRequestData);
        setNftStatus((prev) => ({ ...prev, [course.enrollment_id]: 'minted' }));
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error saving NFT minting details to backend:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            requestData: backendRequestData
          });
        } else {
          console.error('Error saving NFT minting details to backend:', error);
        }
        setNftStatus((prev) => ({ ...prev, [course.enrollment_id]: 'not_minted' }));
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error minting NFT:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('Error minting NFT:', error);
      }
      setNftStatus((prev) => ({ ...prev, [course.enrollment_id]: 'not_minted' }));
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <StudentHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <StudentSidebar />
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
                <BookOpen className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Courses</h4>
                <p className="text-sm text-gray-500">Track your enrolled courses</p>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">My Courses</CardTitle>
                      <CardDescription className="text-buttonsCustom-500 mt-1">
                        Start watching courses now from your dashboard page
                      </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
                      <Input
                        type="search"
                        placeholder="Search Your Courses"
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
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="px-6 py-3 text-left">Course Details</TableHead>
                            <TableHead className="px-6 py-3 text-left">Enrollment Date</TableHead>
                            <TableHead className="px-6 py-3 text-left">Progress</TableHead>
                            <TableHead className="px-6 py-3 text-left">Status</TableHead>
                            <TableHead className="px-6 py-3 text-left">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                          {filteredCourses.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md"
                              >
                                <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                  No courses found
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                  Enroll in a course to get started
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCourses.map((course, index) => (
                              <motion.tr 
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white hover:bg-gray-50"
                              >
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-24 overflow-hidden rounded-lg">
                                      <Image
                                        src={course.course.image}
                                        alt={course.course.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <h4 className="font-medium text-buttonsCustom-900">
                                        {course.course.title}
                                      </h4>
                                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                          <Languages className="h-4 w-4 text-buttonsCustom-600" />
                                          {course.course.language}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <BarChart3 className="h-4 w-4 text-buttonsCustom-600" />
                                          {course.course.level}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <Star className="h-4 w-4 text-yellow-500" />
                                          {(course.course.average_rating || 0).toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-700">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Calendar className="h-4 w-4 text-buttonsCustom-600" />
                                    {moment(course.date).format("D MMM, YYYY")}
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-700">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <BookOpen className="h-4 w-4 text-buttonsCustom-600" />
                                    {course.curriculum.reduce(
                                      (total, section) =>
                                        total + section.variant_items.length,
                                      0
                                    )} Lectures
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-gray-700">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    {nftStatus[course.enrollment_id] === 'minted' ? (
                                      <>
                                    <BookOpenCheck className="h-4 w-4 text-green-500" />
                                        Minted
                                      </>
                                    ) : nftStatus[course.enrollment_id] === 'minting' ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-buttonsCustom-600 mr-2" />
                                        Minting...
                                      </>
                                    ) : (
                                      <>
                                        <BookOpenCheck className="h-4 w-4 text-gray-400" />
                                        Not Minted
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                  <div className="flex gap-2">
                                  <Button
                                    variant={
                                      course.completed_lesson.length > 0
                                        ? "default"
                                        : "secondary"
                                    }
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      router.push(
                                        `/student/course/${course.enrollment_id}`
                                      )
                                    }
                                  >
                                    {course.completed_lesson.length > 0
                                      ? "Continue"
                                        : "Start"} {" "}
                                    Course
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2"
                                      disabled={nftStatus[course.enrollment_id] === 'minted' || nftStatus[course.enrollment_id] === 'minting' || mintAttempted[course.enrollment_id]}
                                      onClick={() => handleMintNFT(course)}
                                    >
                                      {nftStatus[course.enrollment_id] === 'minted'
                                        ? 'NFT Minted'
                                        : nftStatus[course.enrollment_id] === 'minting'
                                        ? 'Minting...'
                                        : 'Mint NFT'}
                                    </Button>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            ))
                          )}
                        </TableBody>
                      </Table>
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
