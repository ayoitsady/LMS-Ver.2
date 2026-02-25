"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import ReactPlayer from "react-player";
import moment from "moment";
import { motion } from "framer-motion";
import {
  Play,
  PenSquare,
  Trash2,
  Search,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Pause,
  BookOpen,
  FileText,
  MessageCircle,
  Star,
  File,
  Download,
  Loader,
} from "lucide-react";
import { CardanoWallet, useWallet, useAssets } from "@meshsdk/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import apiInstance from "@/utils/axios";

import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";

interface VariantItem {
  id: number;
  title: string;
  file: string;
  duration: string;
}

interface Note {
  id: number;
  title: string;
  note: string;
}

interface CompletedLesson {
  id: number;
  user: number;
  course: number;
  variant_item: {
    variant_item_id: number;
    id: number;
  };
}

interface Question {
  id: number;
  title: string;
  message: string;
  user: number;
  course: number;
  created_at: string;
  qa_id: number;
  profile: {
    full_name: string;
  };
  messages: {
    date: string;
    message: string;
    profile: {
      full_name: string;
    };
  }[];
  date: string;
}

interface Review {
  id: number;
  rating: number;
  review: string;
  user: number;
  course: number;
}

interface Course {
  course: {
    id: number;
    title: string;
    description: string;
    instructor: {
      id: number;
      name: string;
      avatar: string;
    };
    course_id: string;
  };
  lectures: VariantItem[];
  completed_lesson: CompletedLesson[];
  question_answer: Question[];
  review: Review;
  note: Note[];
  curriculum: {
    variant_id: number;
    title: string;
    content_duration: string;
    variant_items: {
      id: number;
      title: string;
      preview: boolean;
      duration: string;
      file: string;
      variant_item_id: string;
    }[];
  }[];
}

interface Quiz {
  quiz_id: string;
  course_id: string;
  title: string;
  description: string;
  time_limit: number;
  max_attempts: number;
  min_pass_points: number;
}

interface QuizAttempt {
  id: number;
  score: number;
  completed_at: string;
  total_possible?: number;
  percentage?: number;
  passed?: boolean;
  min_pass_points?: number;
  attempt_id?: string;
}

// Helper function to determine file type
const getFileType = (url: string): "video" | "pdf" | "document" | "other" => {
  if (!url) return "other";
  const extension = url.split(".").pop()?.toLowerCase();

  if (["mp4", "webm", "ogg", "mov", ".avi", ".mkv"].includes(extension || "")) {
    return "video";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (
    ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(
      extension || ""
    )
  ) {
    return "document";
  }

  return "other";
};

function CourseDetailContent(props: { course: Course | null }) {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(props.course);
  const [isLoading, setIsLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt[]>>({});
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  const [variantItem, setVariantItem] = useState<VariantItem | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState<Record<string, string>>({});
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Question | null>(null);
  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState<Review | null>(null);

  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const lastElementRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isLectureModalOpen) {
      setIsPlaying(false);
    }
  }, [isLectureModalOpen]);

  const fetchCourseDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiInstance.get(
        `student/course-detail/${UserData()?.user_id}/${params.enrollment_id}/`
      );
      const courseData = response.data;
      console.log("Fetched Course Data Structure:", courseData);
      setCourse(courseData);
      setQuestions(courseData.question_answer);
      setStudentReview(courseData.review);

      const percentageCompleted =
        (courseData.completed_lesson?.length / courseData.lectures?.length) * 100;
      setCompletionPercentage(Number(percentageCompleted?.toFixed(0) || 0));
    } catch (error) {
      console.error("Error fetching course details:", error);
      Toast().fire({ icon: "error", title: "Failed to load course content" });
    } finally {
      setIsLoading(false);
    }
  }, [params.enrollment_id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  useEffect(() => {
    if (isLoading || !course?.course.course_id) {
      return;
    }

    const fetchQuizzesAndAttempts = async () => {
      setLoadingQuiz(true);
      try {
        const quizListRes = await apiInstance.get<Quiz[]>(`quiz/course/${course.course.course_id}/`);
        const fetchedQuizzes = quizListRes.data || [];
        setQuizzes(fetchedQuizzes);

        if (fetchedQuizzes.length > 0) {
          const attemptPromises = fetchedQuizzes.map(async quiz => {
            try {
              // First get the basic attempts list
              const attemptsRes = await apiInstance.get<QuizAttempt[]>(`quiz/attempts/${quiz.quiz_id}/`);
              const basicAttempts = attemptsRes.data || [];
              
              // Then fetch detailed results for each attempt
              const detailedAttempts = await Promise.all(
                basicAttempts.map(async (attempt) => {
                  try {
                    const resultRes = await apiInstance.get(`quiz/attempt/${attempt.id}/result/`);
                    return {
                      ...attempt,
                      total_possible: resultRes.data.total_possible,
                      percentage: resultRes.data.percentage,
                      passed: resultRes.data.passed,
                      min_pass_points: resultRes.data.min_pass_points
                    };
                  } catch (error) {
                    console.error(`Failed to fetch detailed result for attempt ${attempt.id}:`, error);
                    // If detailed fetch fails, use quiz's min_pass_points as fallback
                    return {
                      ...attempt,
                      min_pass_points: quiz.min_pass_points
                    };
                  }
                })
              );
              
              return { quizId: quiz.quiz_id, attempts: detailedAttempts };
            } catch (error) {
              console.error(`Failed to fetch attempts for quiz ${quiz.quiz_id}:`, error);
              return { quizId: quiz.quiz_id, attempts: [] };
            }
          });

          const attemptsResults = await Promise.all(attemptPromises);
          const attemptsMap = attemptsResults.reduce((acc, result) => {
            acc[result.quizId] = result.attempts;
            return acc;
          }, {} as Record<string, QuizAttempt[]>);
          setQuizAttempts(attemptsMap);
        }
      } catch (error) {
        console.error("Failed to fetch quiz data:", error);
        setQuizzes([]);
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchQuizzesAndAttempts();
  }, [course, isLoading]);

  const handleMarkLessonAsCompleted = async (variantItemId: number) => {
    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus({ ...markAsCompletedStatus, [key]: "Updating" });

    const foundVariantItem = course?.curriculum
      ?.flatMap(section => section.variant_items?.filter(item => item.id === variantItemId))
      .find(Boolean);

    const isAlreadyCompleted = course?.completed_lesson?.some(
      lesson => lesson.variant_item.id === variantItemId
    );

    const requestData = {
      user_id: UserData()?.user_id,
      course_id: course?.course?.id,
      variant_item_id: foundVariantItem?.variant_item_id,
    };

    try {
      await apiInstance.post(`student/course-completed/`, requestData);
      fetchCourseDetail(); // Refetch all data to ensure consistency
      setMarkAsCompletedStatus({ ...markAsCompletedStatus, [key]: "Updated" });
      Toast().fire({
        icon: isAlreadyCompleted ? "info" : "success",
        title: `Lesson marked as ${isAlreadyCompleted ? "not completed" : "completed"}`,
      });
    } catch {
      Toast().fire({ icon: "error", title: "Failed to update lesson status" });
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateNote({ ...createNote, [e.target.name]: e.target.value });
  };

  const handleSubmitCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("user_id", String(UserData()?.user_id || 0));
    formdata.append("enrollment_id", String(params.enrollment_id));
    formdata.append("title", createNote.title);
    formdata.append("note", createNote.note);

    try {
      await apiInstance.post(`student/course-note/${UserData()?.user_id}/${params.enrollment_id}/`, formdata);
      fetchCourseDetail();
      setIsNoteModalOpen(false);
      Toast().fire({ icon: "success", title: "Note created" });
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleSubmitEditNote = async (e: React.FormEvent, noteId: number) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("user_id", String(UserData()?.user_id || 0));
    formdata.append("enrollment_id", String(params.enrollment_id));
    formdata.append("title", createNote.title);
    formdata.append("note", createNote.note);

    try {
      await apiInstance.patch(`student/course-note-detail/${UserData()?.user_id}/${params.enrollment_id}/${noteId}/`, formdata);
      fetchCourseDetail();
      setIsNoteModalOpen(false);
      Toast().fire({ icon: "success", title: "Note updated" });
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await apiInstance.delete(`student/course-note-detail/${UserData()?.user_id}/${params.enrollment_id}/${noteId}/`);
      fetchCourseDetail();
      Toast().fire({ icon: "success", title: "Note deleted" });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateMessage({ ...createMessage, [e.target.name]: e.target.value });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("course_id", String(course?.course?.id || 0));
    formdata.append("user_id", String(UserData()?.user_id || 0));
    formdata.append("title", createMessage.title);
    formdata.append("message", createMessage.message);

    try {
      await apiInstance.post(`student/question-answer-list-create/${course?.course?.id}/`, formdata);
      fetchCourseDetail();
      setIsQuestionModalOpen(false);
      Toast().fire({ icon: "success", title: "Question sent" });
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const sendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("course_id", String(course?.course?.id || 0));
    formdata.append("user_id", String(UserData()?.user_id || 0));
    formdata.append("message", createMessage.message);
    formdata.append("qa_id", String(selectedConversation?.qa_id || 0));

    try {
      const response = await apiInstance.post(`student/question-answer-message-create/`, formdata);
      setSelectedConversation(response.data.question);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
      fetchCourseDetail();
    } else {
      const filtered = questions?.filter(q => q.title.toLowerCase().includes(query));
      setQuestions(filtered);
    }
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateReview({ ...createReview, [e.target.name]: e.target.value });
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("course_id", String(course?.course?.id || 0));
    formdata.append("user_id", String(UserData()?.user_id || 0));
    formdata.append("rating", String(createReview.rating));
    formdata.append("review", createReview.review);

    try {
      await apiInstance.post(`student/rate-course/`, formdata);
      fetchCourseDetail();
      Toast().fire({ icon: "success", title: "Review created" });
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  const handleUpdateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("course", String(course?.course?.id || 0));
    formdata.append("user", String(UserData()?.user_id || 0));
    formdata.append("rating", String(createReview?.rating || studentReview?.rating || ""));
    formdata.append("review", String(createReview?.review || studentReview?.review || ""));

    try {
      await apiInstance.patch(`student/review-detail/${UserData()?.user_id}/${studentReview?.id}/`, formdata);
      fetchCourseDetail();
      Toast().fire({ icon: "success", title: "Review updated" });
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  // Video Player Handlers
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  const handleMute = () => setIsMuted(!isMuted);
  const handleProgress = (state: { played: number }) => setPlayed(state.played);
  const handleDuration = (duration: number) => setDuration(duration);
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    playerRef.current?.seekTo(pos);
  };
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector(".video-container");
    if (!videoContainer) return;

    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  const formatDuration = (duration: string) => {
    if (!duration) return "0m 0s";
    const parts = duration.split(":");
    if (parts.length === 2) {
      return `${parts[0]}m ${parts[1]}s`;
    } else if (parts.length === 3) {
      return `${parts[0]}h ${parts[1]}m ${parts[2]}s`;
    }
    return duration;
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader className="h-8 w-8 animate-spin text-buttonsCustom-600" />
        <span className="ml-3 text-gray-500">Loading Course...</span>
      </div>
    );
  }

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
                <h4 className="text-xl font-bold text-gray-900">Course Content</h4>
                <p className="text-sm text-gray-500">{course?.course?.title}</p>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">{course?.course?.title}</CardTitle>
                  <CardDescription className="mt-1 sm:mt-2 line-clamp-3 text-sm sm:text-base text-buttonsCustom-500">
                    {course?.course?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="curriculum" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                      <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                      <TabsTrigger value="qa">Q&A</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    </TabsList>
                    <TabsContent value="curriculum" className="mt-4 sm:mt-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <Progress value={completionPercentage} className="h-2 bg-gray-100" />
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{completionPercentage}% Complete</p>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {course?.curriculum?.map(section => (
                            <AccordionItem key={section.variant_id} value={section.variant_id.toString()} className="border-buttonsCustom-200">
                              <AccordionTrigger className="text-sm sm:text-base font-medium py-3 px-4 hover:bg-buttonsCustom-50">
                                <div className="flex items-center">
                                  <span>{section.title}</span>
                                  <span className="text-xs sm:text-sm text-gray-500 ml-2">({section.variant_items?.length} Lectures)</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="py-0">
                                <div className="space-y-1 divide-y divide-buttonsCustom-100">
                                  {section.variant_items?.map(lecture => (
                                    <div key={lecture.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                      <div className="flex items-center gap-2 sm:gap-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-buttonsCustom-600" onClick={() => { setVariantItem(lecture); setIsLectureModalOpen(true); }}>
                                          <Play className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm sm:text-base font-medium">{lecture.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                                        <span className="text-xs sm:text-sm text-gray-500">{formatDuration(lecture.duration || "0:0")}</span>
                                        <div className="flex items-center">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-buttonsCustom-600"
                                            checked={course.completed_lesson?.some(cl => cl.variant_item.id === lecture.id)}
                                            onChange={() => handleMarkLessonAsCompleted(lecture.id)}
                                          />
                                        </div>
                                        <span className="ml-2 text-xs text-buttonsCustom-500">
                                          {course.completed_lesson?.some(cl => cl.variant_item.id === lecture.id) ? "Completed" : ""}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </TabsContent>
                    <TabsContent value="qa" className="mt-4 sm:mt-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-buttonsCustom-600" />
                            <h3 className="text-base sm:text-lg font-medium">Questions & Answers</h3>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
                              <Input type="search" placeholder="Search questions" onChange={handleSearchQuestion} className="pl-10 border-buttonsCustom-200 focus:border-buttonsCustom-500" />
                            </div>
                            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="w-full sm:w-auto bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">
                                  <MessageSquare className="h-4 w-4 mr-2" /> Ask Question
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-white">
                                <DialogHeader><DialogTitle className="text-base sm:text-lg">Ask a Question</DialogTitle></DialogHeader>
                                <form onSubmit={handleSaveQuestion} className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Question Title</label>
                                    <Input name="title" value={createMessage.title} onChange={handleMessageChange} placeholder="Enter question title" className="border-gray-200 focus-visible:ring-buttonsCustom-500" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Question Details</label>
                                    <Textarea name="message" value={createMessage.message} onChange={handleMessageChange} placeholder="Enter your question" rows={4} className="border-gray-200 focus-visible:ring-buttonsCustom-500 resize-none" />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsQuestionModalOpen(false)} className="border-buttonsCustom-200 text-buttonsCustom-700">Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">Send Question</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          {questions?.length === 0 ? (
                            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                              <MessageCircle className="h-12 w-12 mx-auto text-gray-300" />
                              <h3 className="mt-4 text-lg font-medium text-gray-900">No questions yet</h3>
                              <p className="mt-2 text-sm text-gray-500">Ask your first question to get help from instructors</p>
                            </div>
                          ) : (
                            questions?.map(question => (
                              <motion.div key={question.qa_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-white/90 border-buttonsCustom-200 overflow-hidden hover:shadow-md transition-shadow">
                                  <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="h-8 w-8 rounded-full bg-buttonsCustom-100 flex items-center justify-center text-buttonsCustom-600">
                                        {question.profile.full_name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{question.profile.full_name}</p>
                                        <p className="text-xs text-gray-500">{moment(question.date).format("MMM DD, YYYY")}</p>
                                      </div>
                                    </div>
                                    <h4 className="text-base font-medium text-buttonsCustom-900 mb-3">{question.title}</h4>
                                    <Button variant="outline" size="sm" className="text-buttonsCustom-600 border-buttonsCustom-200" onClick={() => { setSelectedConversation(question); setIsConversationModalOpen(true); setCreateMessage({ title: "", message: "" }); }}>
                                      Join Conversation <MessageSquare className="h-4 w-4 ml-2" />
                                    </Button>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notes" className="mt-4 sm:mt-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-buttonsCustom-600" />
                            <h3 className="text-base sm:text-lg font-medium">My Study Notes</h3>
                          </div>
                          <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full sm:w-auto bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">
                                <PenSquare className="h-4 w-4 mr-2" /> Add Note
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white">
                              <DialogHeader><DialogTitle className="text-base sm:text-lg">{selectedNote ? "Edit Note" : "Add New Note"}</DialogTitle></DialogHeader>
                              <form onSubmit={e => selectedNote ? handleSubmitEditNote(e, selectedNote.id) : handleSubmitCreateNote(e)} className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Note Title</label>
                                  <Input name="title" value={createNote.title} onChange={handleNoteChange} placeholder="Enter note title" className="border-gray-200 focus-visible:ring-buttonsCustom-500" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Note Content</label>
                                  <Textarea name="note" value={createNote.note} onChange={handleNoteChange} placeholder="Enter note content" rows={4} className="border-gray-200 focus-visible:ring-buttonsCustom-500 resize-none" />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" size="sm" onClick={() => setIsNoteModalOpen(false)} className="border-buttonsCustom-200 text-buttonsCustom-700">Cancel</Button>
                                  <Button type="submit" size="sm" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">Save Note</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="grid gap-4">
                          {course?.note?.length === 0 ? (
                            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                              <FileText className="h-12 w-12 mx-auto text-gray-300" />
                              <h3 className="mt-4 text-lg font-medium text-gray-900">No notes yet</h3>
                              <p className="mt-2 text-sm text-gray-500">Create your first note to keep track of important points</p>
                            </div>
                          ) : (
                            course?.note?.map(note => (
                              <Card key={note.id} className="bg-white/90 border-buttonsCustom-200 overflow-hidden">
                                <CardContent className="p-4 sm:p-5">
                                  <h4 className="text-base sm:text-lg font-medium text-buttonsCustom-900 mb-2">{note.title}</h4>
                                  <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{note.note}</p>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="text-buttonsCustom-600 border-buttonsCustom-200" onClick={() => { setSelectedNote(note); setCreateNote({ title: note.title, note: note.note }); setIsNoteModalOpen(true); }}>
                                      <PenSquare className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteNote(note.id)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-4 sm:mt-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="h-5 w-5 text-buttonsCustom-600" />
                          <h3 className="text-base sm:text-lg font-medium">Rate This Course</h3>
                        </div>
                        <Card className="bg-white/90 border-buttonsCustom-200 overflow-hidden">
                          <CardContent className="p-4 sm:p-6">
                            {!studentReview ? (
                              <form onSubmit={handleCreateReviewSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Rating</label>
                                  <Select name="rating" value={createReview.rating.toString()} onValueChange={value => setCreateReview({ ...createReview, rating: parseInt(value) })}>
                                    <SelectTrigger className="border-gray-200 focus:ring-buttonsCustom-500"><SelectValue placeholder="Select rating" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">★☆☆☆☆ (1/5)</SelectItem>
                                      <SelectItem value="2">★★☆☆☆ (2/5)</SelectItem>
                                      <SelectItem value="3">★★★☆☆ (3/5)</SelectItem>
                                      <SelectItem value="4">★★★★☆ (4/5)</SelectItem>
                                      <SelectItem value="5">★★★★★ (5/5)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Review</label>
                                  <Textarea name="review" value={createReview.review} onChange={handleReviewChange} placeholder="Share your experience with this course..." rows={4} className="border-gray-200 focus-visible:ring-buttonsCustom-500 resize-none" />
                                </div>
                                <Button type="submit" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">Submit Review</Button>
                              </form>
                            ) : (
                              <form onSubmit={handleUpdateReviewSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Rating</label>
                                  <Select name="rating" defaultValue={studentReview.rating.toString()} onValueChange={value => setCreateReview({ ...createReview, rating: parseInt(value) })}>
                                    <SelectTrigger className="border-gray-200 focus:ring-buttonsCustom-500"><SelectValue placeholder="Select rating" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">★☆☆☆☆ (1/5)</SelectItem>
                                      <SelectItem value="2">★★☆☆☆ (2/5)</SelectItem>
                                      <SelectItem value="3">★★★☆☆ (3/5)</SelectItem>
                                      <SelectItem value="4">★★★★☆ (4/5)</SelectItem>
                                      <SelectItem value="5">★★★★★ (5/5)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Review</label>
                                  <Textarea name="review" defaultValue={studentReview.review} onChange={handleReviewChange} placeholder="Share your experience with this course..." rows={4} className="border-gray-200 focus-visible:ring-buttonsCustom-500 resize-none" />
                                </div>
                                <Button type="submit" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">Update Review</Button>
                              </form>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="quiz" className="mt-4 sm:mt-6">
                      {loadingQuiz ? (
                        <div className="flex justify-center items-center py-8">
                           <Loader className="h-8 w-8 animate-spin text-buttonsCustom-600" />
                           <span className="ml-3 text-gray-500">Loading Quizzes...</span>
                        </div>
                      ) : quizzes.length > 0 ? (
                        <div className="space-y-6">
                          {quizzes.map(quiz => {
                            const attempts = quizAttempts[quiz.quiz_id] || [];
                            const attemptsLeft = quiz.max_attempts - attempts.length;
                            const hasAttempts = attempts.length > 0;

                            return (
                              <Card key={quiz.quiz_id} className="bg-white/90 border-buttonsCustom-200 overflow-hidden transition hover:shadow-lg">
                                <CardHeader>
                                  <CardTitle>{quiz.title}</CardTitle>
                                  <CardDescription>{quiz.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="bg-blue-50 p-3 rounded-lg flex-1">
                                      <p className="font-semibold text-blue-800">Time Limit</p>
                                      <p className="text-blue-700">{quiz.time_limit} minutes</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg flex-1">
                                      <p className="font-semibold text-green-800">Attempts Left</p>
                                      <p className="text-green-700">{attemptsLeft} / {quiz.max_attempts}</p>
                                    </div>
                                  </div>

                                  {/* Attempt Results Section */}
                                  {hasAttempts && (
                                    <div className="mb-6">
                                      <h4 className="font-semibold text-gray-800 mb-3">Your Attempt Results</h4>
                                      <div className="space-y-3">
                                        {attempts.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map((attempt, index) => {
                                          // Calculate passed status if not provided by API
                                          console.log('Attempt data:', {
                                            id: attempt.id,
                                            score: attempt.score,
                                            total_possible: attempt.total_possible,
                                            min_pass_points: attempt.min_pass_points,
                                            passed: attempt.passed,
                                            percentage: attempt.percentage
                                          });
                                          
                                          // Use API passed status if available, otherwise calculate
                                          let isPassed = false;
                                          if (attempt.passed !== undefined) {
                                            isPassed = attempt.passed;
                                          } else if (attempt.min_pass_points !== undefined && attempt.score !== undefined) {
                                            isPassed = attempt.score >= attempt.min_pass_points;
                                          }
                                          
                                          console.log('Calculated isPassed:', isPassed, 'Score:', attempt.score, 'Min Pass:', attempt.min_pass_points);
                                          
                                          return (
                                            <div key={attempt.attempt_id} className={`p-4 rounded-lg border-2 ${isPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-600">Attempt #{attempts.length - index}</span>
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${isPassed ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                      {isPassed ? 'PASSED' : 'FAILED'}
                                                    </span>
                                                  </div>
                                                  <div className="flex flex-wrap gap-4 text-sm">
                                                    <div>
                                                      <span className="font-medium text-gray-700">Score:</span>
                                                      <span className="ml-1 font-bold text-gray-900">
                                                        {attempt.score}
                                                        {attempt.total_possible && `/${attempt.total_possible}`}
                                                      </span>
                                                    </div>
                                                    {attempt.percentage && (
                                                      <div>
                                                        <span className="font-medium text-gray-700">Percentage:</span>
                                                        <span className="ml-1 font-bold text-gray-900">{attempt.percentage}%</span>
                                                      </div>
                                                    )}
                                                    <div>
                                                      <span className="font-medium text-gray-700">Completed:</span>
                                                      <span className="ml-1 text-gray-600">{moment(attempt.completed_at).format('MMM DD, YYYY • h:mm a')}</span>
                                                    </div>
                                                    {attempt.min_pass_points !== undefined && (
                                                      <div>
                                                        <span className="font-medium text-gray-700">Min Pass:</span>
                                                        <span className="ml-1 text-gray-600">{attempt.min_pass_points} points</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-4 items-center">
                                    {attemptsLeft > 0 ? (
                                      <Button asChild className="w-full sm:w-auto bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold shadow">
                                        <Link href={`/student/quiz/${quiz.quiz_id}/take`}>
                                          {hasAttempts ? 'Retake Quiz' : 'Start Quiz'}
                                        </Link>
                                      </Button>
                                    ) : (
                                      <Button disabled className="w-full sm:w-auto bg-gray-400 text-white font-semibold shadow cursor-not-allowed">
                                        {hasAttempts ? 'Retake Quiz' : 'Start Quiz'}
                                      </Button>
                                    )}
                                  </div>
                                  {attemptsLeft <= 0 && <p className="text-red-500 text-sm mt-2">You have no attempts left for this quiz.</p>}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                           <FileText className="h-12 w-12 mx-auto text-gray-300" />
                           <h3 className="mt-4 text-lg font-medium text-gray-900">No Quizzes Available</h3>
                           <p className="mt-2 text-sm text-gray-500">There are no quizzes for this course yet. Check back later!</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Dialog open={isLectureModalOpen} onOpenChange={setIsLectureModalOpen}>
        <DialogContent className="max-w-3xl sm:max-w-4xl md:max-w-5xl p-0 overflow-hidden bg-black border border-buttonsCustom-500">
          <DialogHeader className="p-4 bg-buttonsCustom-500 border-b border-buttonsCustom-700">
            <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-white">{variantItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="relative bg-black rounded-lg overflow-hidden group video-container">
            {variantItem?.file && getFileType(variantItem.file) === "video" ? (
              <>
                <div className="aspect-video cursor-pointer" onClick={handlePlayPause}>
                  <ReactPlayer
                    ref={playerRef}
                    url={variantItem.file}
                    controls={false}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    volume={isMuted ? 0 : volume}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={() => setIsPlaying(false)}
                    config={{ file: { attributes: { controlsList: "nodownload", style: { pointerEvents: "none" } } } }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <div className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer" onClick={handleSeek}>
                      <div className="h-full bg-buttonsCustom-500 rounded-full" style={{ width: `${played * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-buttonsCustom-400"><SkipBack className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-buttonsCustom-400" onClick={handlePlayPause}>
                          {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-buttonsCustom-400"><SkipForward className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-buttonsCustom-400" onClick={handleMute}>
                            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </Button>
                          <input type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 sm:w-20 h-1 bg-gray-600 rounded-full cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-white">{formatTime(played * duration)} / {formatTime(duration)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-buttonsCustom-400" onClick={toggleFullscreen}>
                          {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : variantItem?.file && getFileType(variantItem.file) === "pdf" ? (
              <div className="h-[60vh] flex items-center justify-center bg-gray-100">
                <iframe src={`${variantItem.file}#toolbar=0`} className="w-full h-full" title={variantItem.title} />
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
                  <File className="h-16 w-16 text-buttonsCustom-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{variantItem?.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">This file type cannot be previewed directly</p>
                  <a href={variantItem?.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-buttonsCustom-500 hover:bg-buttonsCustom-600 text-white px-4 py-2 rounded-md transition-colors">
                    <Download className="h-4 w-4" /> Download File
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-buttonsCustom-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-buttonsCustom-100">
                  {getFileType(variantItem?.file || "") === "video"
                    ? `Duration: ${formatDuration(variantItem?.duration || "")}`
                    : `File Type: ${getFileType(variantItem?.file || "").toUpperCase()}`}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleMarkLessonAsCompleted(variantItem?.id || 0)} className="w-full sm:w-auto bg-buttonsCustom-700 border-buttonsCustom-600 text-white hover:bg-buttonsCustom-700">
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {course?.completed_lesson?.some(cl => cl.variant_item.id === variantItem?.id) ? "Mark as Not Complete" : "Mark as Complete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isConversationModalOpen} onOpenChange={setIsConversationModalOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl p-0 bg-white overflow-hidden border border-buttonsCustom-200">
          <DialogHeader className="p-4 bg-buttonsCustom-50 border-b border-buttonsCustom-100">
            <DialogTitle className="text-base sm:text-lg md:text-xl text-buttonsCustom-900">{selectedConversation?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="h-[300px] sm:h-[400px] overflow-y-auto space-y-3 pr-2">
              {selectedConversation?.messages?.map((message, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 bg-buttonsCustom-50 p-3 sm:p-4 rounded-lg border border-buttonsCustom-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-buttonsCustom-100 flex items-center justify-center text-buttonsCustom-600">
                        {message.profile.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{message.profile.full_name}</p>
                        <p className="text-xs text-gray-500">{moment(message.date).format("MMM DD, YYYY • h:mm a")}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={lastElementRef} />
            </div>
            <form onSubmit={sendNewMessage} className="flex gap-2 mt-4 border-t border-buttonsCustom-100 pt-4">
              <Textarea
                name="message"
                value={createMessage.message}
                onChange={handleMessageChange}
                placeholder="Type your message..."
                className="flex-1 border-buttonsCustom-200 focus-visible:ring-buttonsCustom-500 resize-none"
                rows={2}
              />
              <Button type="submit" size="icon" className="h-auto bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const { connected } = useWallet();
  const assets = useAssets();
  const [assetId, setAssetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [nftNotFound, setNftNotFound] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);

  // 1. Fetch asset ID from backend
  useEffect(() => {
    if (!connected) return;
    setLoading(true);
    setNftNotFound(false);
    apiInstance
      .get(`nft/asset-id/${params.enrollment_id}/`)
      .then((res) => {
        if (res.data.asset_id) {
          setAssetId(res.data.asset_id);
        } else {
          setNftNotFound(true);
        }
      })
      .catch(() => {
        setNftNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [connected, params.enrollment_id]);

  // 2. Check if wallet has the asset
  useEffect(() => {
    if (!assetId || !assets) {
      setHasAccess(false);
      return;
    }
    const found = assets.some((asset) => asset.unit.startsWith(assetId));
    setHasAccess(found);
  }, [assetId, assets]);

  // 3. Fetch course details only if access is granted
  useEffect(() => {
    if (!hasAccess) return;
    const fetchCourseDetail = async () => {
      try {
        const response = await apiInstance.get(
          `student/course-detail/${UserData()?.user_id}/${params.enrollment_id}/`
        );
        setCourse(response.data);
      } catch {
        // Optionally handle error
      }
    };
    fetchCourseDetail();
  }, [hasAccess, params.enrollment_id]);

  // 4. UI logic
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Connect Your Wallet</h2>
              <p>Please connect your wallet to verify course access</p>
              <div className="flex justify-center pt-4">
                <CardanoWallet />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p>Checking NFT access...</p>
        </div>
      </div>
    );
  }

  if (nftNotFound || !assetId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Access Required</h2>
              <p>You don&apos;t have access to this course yet.</p>
              <div className="pt-4">
                <Link href="/student/courses">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    Purchase Course NFT
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Access Required</h2>
              <p>Your wallet does not hold the required NFT for this course.</p>
              <div className="pt-4">
                <Link href="/student/courses">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    Purchase Course NFT
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the original course page content
  return <CourseDetailContent course={course} />;
}
