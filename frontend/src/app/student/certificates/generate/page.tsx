"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  BookOpen,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
// import { useToast } from "@/components/ui/use-toast";
import apiInstance from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";

// Types
interface Course {
  id: number;
  course_id: string;
  title: string;
  description: string;
  level: string;
  image: string | null;
  teacher: {
    id: number;
    full_name: string;
  } | null;
  total_lectures: number;
}

interface CourseData {
  course: {
    id: number;
    title: string;
    description: string;
    level: string;
    image: string | null;
    course_id: string;
  };
  enrollment_id: string;
  instructor: {
    id: number;
    name: string;
  } | null;
  lectures: Array<unknown>;
  completed_lesson: Array<unknown>;
}

interface CourseCompletion {
  course_id: string;
  completed_lessons: number;
  total_lectures: number;
  completion_percentage: number;
  hasCertificate: boolean;
  certificate_id?: string;
  hasPassedQuizAttempt: boolean;
  quizAttempts?: Array<{
    quiz_id: string;
    quiz_title: string;
    has_attempted: boolean;
    total_attempts: number;
    best_score: number;
    passed: boolean;
    attempts_remaining: number;
    min_pass_points: number;
    max_attempts?: number;
  }>;
}

interface Certificate {
  id: number;
  course: number;
  user: number;
  certificate_id: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  issue_date: string;
  verification_url: string | null;
  status: 'active' | 'revoked' | 'expired';
  pdf_file: string | null;
  metadata: Record<string, unknown>;
  course_title: string;
  teacher_name: string | null;
  user_name: string | null;
  course_image: string | null;
  course_level: string;
  course_description: string;
}

interface CertificateErrorResponse {
  message: string;
  completed_lessons?: number;
  total_lectures?: number;
  completion_percentage?: number;
}

// Temporarily creating a mock useToast until proper component is available
const useToast = () => {
  return {
    toast: ({ title, description }: { 
      title: string; 
      description: string; 
      variant?: 'default' | 'destructive' 
    }) => {
      console.log(`Toast: ${title} - ${description}`);
    }
  };
};

// Types for API error handling
interface ApiErrorResponse {
  response: {
    status: number;
    data: CertificateErrorResponse;
  };
}

// Type guard for API errors
function isApiError(obj: unknown): obj is ApiErrorResponse {
  return Boolean(
    obj && 
    typeof obj === 'object' && 
    'response' in obj &&
    obj.response && 
    typeof obj.response === 'object' &&
    'status' in obj.response &&
    'data' in obj.response
  );
}

// Custom hook for certificate generation
const useCertificate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [incompleteData, setIncompleteData] = useState<CertificateErrorResponse | null>(null);
  const { toast } = useToast();

  const generateCertificate = async (user_id: string | number, course_id: string | number) => {
    setIsLoading(true);
    setError(null);
    setCertificate(null);
    setIncompleteData(null);

    try {
      const response = await apiInstance.post('/student/certificate/create/', {
        user_id,
        course_id
      });

      if (response.status === 201) {
        // New certificate created
        setCertificate(response.data);
        toast({
          title: "Certificate Generated!",
          description: "Your certificate has been successfully created.",
          variant: "default",
        });
      } else if (response.status === 200) {
        // Certificate already exists
        setCertificate(response.data);
        toast({
          title: "Certificate Found",
          description: "You already have a certificate for this course.",
          variant: "default",
        });
      }
    } catch (err: unknown) {
      if (isApiError(err) && err.response.status === 400) {
        // Course not completed
        setIncompleteData(err.response.data);
        setError(err.response.data.message || "Course not completed");
      } else {
        setError("Failed to generate certificate. Please try again later.");
      }
      
      toast({
        title: "Error",
        description: isApiError(err) && err.response.data.message 
          ? err.response.data.message 
          : "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    certificate,
    incompleteData,
    generateCertificate
  };
};

export default function CertificateGenerationPage() {
  const [completedCourses, setCompletedCourses] = useState<(Course & CourseCompletion)[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<(Course & CourseCompletion) | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { 
    isLoading: isGenerating, 
    certificate, 
    incompleteData,
    generateCertificate 
  } = useCertificate();

  // Effect to refresh courses after certificate generation
  useEffect(() => {
    if (certificate) {
      fetchCourses();
    }
  }, [certificate]);

  // Effect to display incomplete data in UI if available
  useEffect(() => {
    if (incompleteData && selectedCourse) {
      // Update the selected course with the latest completion data from the server
      setSelectedCourse({
        ...selectedCourse,
        completed_lessons: incompleteData.completed_lessons || selectedCourse.completed_lessons,
        total_lectures: incompleteData.total_lectures || selectedCourse.total_lectures,
        completion_percentage: incompleteData.completion_percentage || selectedCourse.completion_percentage
      });
    }
  }, [incompleteData, selectedCourse]);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    setApiError(null);
    
    try {
      const userId = UserData()?.user_id;
      if (!userId) throw new Error("User not authenticated");

      // Fetch enrolled courses with completion status
      const coursesResponse = await apiInstance.get(`/student/course-list/${userId}/`);
      const certificatesResponse = await apiInstance.get(`/student/certificate/list/${userId}/`);  
      
      // Check if data is an array
      if (!Array.isArray(coursesResponse.data)) {
        setApiError("The server returned an invalid response format for courses.");
        setCompletedCourses([]);
        return;
      }
      
      // Map certificates to course IDs
      const certificateMap = new Map();
      if (Array.isArray(certificatesResponse.data)) {
        certificatesResponse.data.forEach((cert: Certificate) => {
          certificateMap.set(cert.course, {
            hasCertificate: true,
            certificate_id: cert.certificate_id
          });
        });
      }
      
      // Fetch quiz attempts for each course
      const coursesWithQuizData = await Promise.all(
        coursesResponse.data.map(async (courseData: CourseData) => {
          try {
            // Step 1: Fetch quizzes for this course
            const quizzesResponse = await apiInstance.get(`quiz/course/${courseData.course.course_id}/`);
            const quizzes = quizzesResponse.data || [];
            
            // Step 2: Check student status for each quiz using the new endpoint
            let hasPassedQuizAttempt = false;
            const allQuizStatuses: Array<{
              quiz_id: string;
              quiz_title: string;
              has_attempted: boolean;
              total_attempts: number;
              best_score: number;
              passed: boolean;
              attempts_remaining: number;
              min_pass_points: number;
              max_attempts?: number;
            }> = [];
            
            console.log(`Checking quizzes for course: ${courseData.course.course_id}`);
            console.log(`Found ${quizzes.length} quizzes`);
            
            for (const quiz of quizzes) {
              try {
                // Step 3: Get student status for this quiz
                const statusResponse = await apiInstance.get(`quiz/${quiz.quiz_id}/student-status/`);
                const quizStatus = statusResponse.data;
                
                console.log(`Quiz ${quiz.quiz_id} status:`, quizStatus);
                
                allQuizStatuses.push(quizStatus);
                
                // If any quiz has been passed, mark the course as having a passed attempt
                if (quizStatus.passed === true) {
                  hasPassedQuizAttempt = true;
                  console.log(`Found passed quiz! Course ${courseData.course.course_id} now has passed quiz`);
                }
                
              } catch (error) {
                console.error(`Failed to fetch status for quiz ${quiz.quiz_id}:`, error);
                // Add default status if API fails
                allQuizStatuses.push({
                  quiz_id: quiz.quiz_id,
                  quiz_title: quiz.title || 'Unknown Quiz',
                  has_attempted: false,
                  total_attempts: 0,
                  best_score: 0,
                  passed: false,
                  attempts_remaining: quiz.max_attempts || 0,
                  min_pass_points: quiz.min_pass_points || 0
                });
              }
            }
            
            console.log(`Final result for course ${courseData.course.course_id}: hasPassedQuizAttempt=${hasPassedQuizAttempt}`);
            console.log(`All quiz statuses:`, allQuizStatuses);
            
            // Calculate completion percentage based on completed lessons
            const totalLectures = courseData.lectures?.length || 0;
            const completedLessons = courseData.completed_lesson?.length || 0;
            const completionPercentage = totalLectures > 0 
              ? Math.round((completedLessons / totalLectures) * 100)
              : 0;

            const certInfo = certificateMap.get(courseData.course?.id) || { hasCertificate: false };
            
            // Return course with completion status and quiz data
            return {
              id: courseData.course?.id || 0,
              course_id: courseData.course.course_id || '',
              title: courseData.course?.title || 'Untitled Course',
              description: courseData.course?.description || '',
              level: courseData.course?.level || 'Unknown',
              image: courseData.course?.image || null,
              teacher: courseData.instructor || null,
              total_lectures: totalLectures,
              completed_lessons: completedLessons,
              completion_percentage: completionPercentage,
              hasPassedQuizAttempt,
              quizAttempts: allQuizStatuses,
              ...certInfo
            };
          } catch (error) {
            console.error(`Failed to fetch quiz data for course ${courseData.course.course_id}:`, error);
            // Return course without quiz data if fetch fails
            const totalLectures = courseData.lectures?.length || 0;
            const completedLessons = courseData.completed_lesson?.length || 0;
            const completionPercentage = totalLectures > 0 
              ? Math.round((completedLessons / totalLectures) * 100)
              : 0;

            const certInfo = certificateMap.get(courseData.course?.id) || { hasCertificate: false };
            
            return {
              id: courseData.course?.id || 0,
              course_id: courseData.course.course_id || '',
              title: courseData.course?.title || 'Untitled Course',
              description: courseData.course?.description || '',
              level: courseData.course?.level || 'Unknown',
              image: courseData.course?.image || null,
              teacher: courseData.instructor || null,
              total_lectures: totalLectures,
              completed_lessons: completedLessons,
              completion_percentage: completionPercentage,
              hasPassedQuizAttempt: false,
              quizAttempts: [],
              ...certInfo
            };
          }
        })
      );
      
      setCompletedCourses(coursesWithQuizData);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setApiError("Failed to load courses. Please try again later.");
      setCompletedCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCourses = completedCourses.filter(course => 
    !searchQuery ? true : (course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGenerateCertificate = (course: Course & CourseCompletion) => {
    // Ensure course has all required properties with defaults
    const validatedCourse = {
      ...course,
      title: course.title || 'Untitled Course',
      completion_percentage: typeof course.completion_percentage === 'number' ? course.completion_percentage : 0,
      hasCertificate: !!course.hasCertificate,
      certificate_id: course.certificate_id || '',
      hasPassedQuizAttempt: !!course.hasPassedQuizAttempt,
    };
    
    setSelectedCourse(validatedCourse);
    
    // If certificate already exists, redirect to view it
    if (validatedCourse.hasCertificate && validatedCourse.certificate_id) {
      window.location.href = `/student/certificates/view/${validatedCourse.certificate_id}`;
      return;
    }
    
    // Check if course is 100% completed AND has at least 1 passed quiz attempt
    const isEligibleForCertificate = validatedCourse.completion_percentage === 100 && validatedCourse.hasPassedQuizAttempt;
    
    if (isEligibleForCertificate) {
      // Open confirmation dialog for new certificate
      setAlertOpen(true);
    } else {
      // Show incomplete course message
      setAlertOpen(true);
    }
  };

  const confirmGeneration = () => {
    if (selectedCourse) {
      const userId = UserData()?.user_id;
      if (!userId) return;
      
      generateCertificate(userId, selectedCourse.course_id);
    }
    setAlertOpen(false);
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
                <Award className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Certificate Generation</h4>
                <p className="text-sm text-gray-500">Generate certificates for completed courses</p>
              </div>
            </motion.div>

            {/* Course Search */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative w-full max-w-md"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
              <Input
                type="search"
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 border-buttonsCustom-200 focus:border-buttonsCustom-500"
              />
            </motion.div>

            {/* Courses */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
            >
              {isLoadingCourses ? (
                // Loading Skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-transparent opacity-75 animate-pulse">
                    <div className="w-full h-40 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))
              ) : apiError ? (
                // API Error Message
                <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white/80 rounded-lg border border-red-100">
                  <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Courses</h3>
                  <p className="text-red-600 text-center mb-4">
                    {apiError}
                  </p>
                  <Button 
                    onClick={fetchCourses} 
                    className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full overflow-hidden border-buttonsCustom-100 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                      <div className="relative h-40 w-full">
                        {course.image ? (
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-buttonsCustom-100 to-buttonsCustom-200 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-buttonsCustom-500" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.level}
                          </div>
                        </div>
                        {course.hasCertificate && (
                          <div className="absolute top-2 left-2">
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-buttonsCustom-100 text-buttonsCustom-800 flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-buttonsCustom-900 line-clamp-1">{course.title}</h4>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-buttonsCustom-600 mb-1">
                            <span>Completion</span>
                            <span>{course.completion_percentage}%</span>
                          </div>
                          <Progress 
                            value={course.completion_percentage} 
                            className="h-2 bg-buttonsCustom-100"
                            style={{ 
                              '--progress-foreground': course.completion_percentage === 100 
                                ? 'var(--green-500)' 
                                : 'var(--buttons-custom-500)'
                            } as React.CSSProperties}
                          />
                        </div>
                        <div className="text-xs text-buttonsCustom-500 mt-2">
                          {course.completed_lessons} of {course.total_lectures} lessons completed
                        </div>
                        {course.completion_percentage === 100 && (
                          <div className="text-xs mt-1">
                            {course.hasPassedQuizAttempt ? (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Quiz passed ✓
                              </span>
                            ) : (
                              <span className="text-orange-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Quiz not passed
                              </span>
                            )}
                          </div>
                        )}
                        {course.hasCertificate && (
                          <div className="text-xs mt-1">
                            <span className="text-blue-600 flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Certificate issued ✓
                            </span>
                          </div>
                        )}
                        {course.quizAttempts && course.quizAttempts.length > 0 && (
                          <div className="text-xs mt-1 text-gray-500">
                            {course.quizAttempts.filter(q => q.has_attempted).length} of {course.quizAttempts.length} quizzes attempted
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button
                          onClick={() => handleGenerateCertificate(course)}
                          disabled={course.hasCertificate || !(course.completion_percentage === 100 && course.hasPassedQuizAttempt)}
                          className={`w-full ${
                            course.hasCertificate 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : course.completion_percentage === 100 && course.hasPassedQuizAttempt
                                ? 'bg-buttonsCustom-600 hover:bg-buttonsCustom-700'
                                : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {course.hasCertificate ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              View Certificate
                            </>
                          ) : course.completion_percentage === 100 && course.hasPassedQuizAttempt ? (
                            <>
                              {isGenerating && selectedCourse?.id === course.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Award className="h-4 w-4 mr-2" />
                                  Generate Certificate
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              {course.completion_percentage < 100 ? 'Complete Course' : 'Pass Quiz Required'}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white/80 rounded-lg border border-buttonsCustom-100">
                  <BookOpen className="h-16 w-16 text-buttonsCustom-300 mb-4" />
                  <h3 className="text-lg font-medium text-buttonsCustom-900 mb-2">No Courses Found</h3>
                  <p className="text-buttonsCustom-500 text-center mb-4">
                    {searchQuery 
                      ? `No courses match your search for "${searchQuery}".` 
                      : completedCourses.length > 0
                        ? "You don't have any courses eligible for certificate generation. Complete a course to get a certificate."
                        : "You haven't enrolled in any courses yet."}
                  </p>
                  <Button asChild variant="outline" className="border-buttonsCustom-400 text-buttonsCustom-600">
                    <Link href="/student/courses">
                      {completedCourses.length > 0 ? "View All Courses" : "Browse Courses"} <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
            
            {/* Certificate Generated Success Message */}
            {certificate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-green-800">Certificate Generated!</h3>
                    <div className="mt-2 text-green-700">
                      <p>Your certificate for &ldquo;{certificate.course_title}&rdquo; has been successfully created.</p>
                    </div>
                    <div className="mt-4">
                      <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href={`/student/certificates/view/${certificate.certificate_id}`}>
                          View Certificate <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog for Certificate Generation */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="border-buttonsCustom-100">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCourse && selectedCourse.completion_percentage === 100 && selectedCourse.hasPassedQuizAttempt
                ? selectedCourse.hasCertificate
                  ? "Certificate Available"
                  : "Generate Certificate" 
                : "Requirements Not Met"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCourse && selectedCourse.completion_percentage === 100 && selectedCourse.hasPassedQuizAttempt
                ? selectedCourse.hasCertificate
                  ? `You already have a certificate for "${selectedCourse.title || 'this course'}". Would you like to view it?`
                  : `You've completed "${selectedCourse.title || 'this course'}" and passed at least one quiz. Would you like to generate your certificate now?`
                : selectedCourse 
                  ? selectedCourse.completion_percentage < 100
                    ? `You've only completed ${selectedCourse.completion_percentage || 0}% of "${selectedCourse.title || 'this course'}". You need to complete 100% of the course to receive a certificate.`
                    : !selectedCourse.hasPassedQuizAttempt
                      ? `You've completed "${selectedCourse.title || 'this course'}" but haven't passed any quizzes yet. You need to pass at least one quiz to receive a certificate.`
                      : "Course information not available."
                  : "Course information not available."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setAlertOpen(false)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {selectedCourse && selectedCourse.completion_percentage === 100 && selectedCourse.hasPassedQuizAttempt ? "Cancel" : "Close"}
            </AlertDialogAction>
            
            {selectedCourse && selectedCourse.completion_percentage === 100 && selectedCourse.hasPassedQuizAttempt && (
              <AlertDialogAction 
                onClick={selectedCourse.hasCertificate 
                  ? () => window.location.href = `/student/certificates/view/${selectedCourse.certificate_id}`
                  : confirmGeneration
                }
                className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
              >
                {selectedCourse.hasCertificate ? (
                  "View Certificate"
                ) : isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Certificate"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 