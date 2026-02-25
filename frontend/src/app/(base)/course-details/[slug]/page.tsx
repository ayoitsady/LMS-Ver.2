"use client";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import useAxios from "../../../../utils/axios";
import CartId from "../../../../views/plugins/CartId";
import GetCurrentAddress from "../../../../views/plugins/UserCountry";
import UserData from "../../../../views/plugins/UserData";
import Toast from "../../../../views/plugins/Toast";
import { motion } from "framer-motion";
import {
  Twitter,
  Facebook,
  Linkedin,
  ChevronDown,
  PlayCircle,
  Lock,
  FileText,
  BookOpen,
  BarChart2, 
  Globe,
  Calendar,
  Users,
  Star,
  ListOrdered,
  ShoppingCart,
  CheckCircle,
  Loader2,
  Heart,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  file?: string;
  category: { title: string };
  average_rating: number;
  students: {
    id: number;
    full_name: string;
    email: string;
    username: string;
    date_joined: string;
  }[];
  level: string;
  date: string;
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
  reviews: {
    profile: { full_name: string };
    rating: number;
    review: string;
    date: string;
  }[];
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

interface WishlistItem {
  id: number;
  course: {
    id: number;
    slug: string;
    title: string;
    image: string;
    level: string;
    language: string;
    price: number;
    average_rating: number;
    students: Array<{ id: number }>;
    reviews: Array<{ id: number }>;
    teacher: {
      full_name: string;
    };
  };
}

function CourseDetail(): React.ReactElement {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addToCartBtn, setAddToCartBtn] = useState<string>("Add To Cart");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);

  const params = useParams();
  const slug = params?.slug as string;
  const userId = UserData()?.user_id || 0;

  const fetchCourse = useCallback(async (): Promise<void> => {
    if (!slug) return;
    try {
      const res = await useAxios.get(`course/course-detail/${slug}/`);
      setCourse(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setIsLoading(false);
    }
  }, [slug]);

  const checkWishlistStatus = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    try {
      const res = await useAxios.get<WishlistItem[]>(`student/wishlist/${userId}/`);
      // Check if this course is in the user's wishlist
      const isInWishlist = res.data.some((item: WishlistItem) => 
        item.course && item.course.slug === slug
      );
      setIsWishlisted(isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  }, [userId, slug]);

  useEffect(() => {
    if (slug) {
      fetchCourse();
      checkWishlistStatus();
    }
  }, [slug, fetchCourse, checkWishlistStatus]);

  const toggleWishlist = async (): Promise<void> => {
    if (!userId || !course) return;
    
    setWishlistLoading(true);
    try {
      // Create FormData
      const formdata = new FormData();
      formdata.append("user_id", userId.toString());
      formdata.append("course_id", course.id.toString());
      
      if (isWishlisted) {
        // Looking at the wishlist page, there's no specific endpoint for removing
        // Instead, we'll call the add/remove toggle endpoint
        await useAxios.post(`student/wishlist/${userId}/`, formdata);
        Toast().fire({ title: "Removed from Wishlist", icon: "success" });
        setIsWishlisted(false);
      } else {
        // Call the same endpoint for adding
        await useAxios.post(`student/wishlist/${userId}/`, formdata);
        Toast().fire({ title: "Added to Wishlist", icon: "success" });
        setIsWishlisted(true);
      }
      
      // Refresh wishlist status after toggling
      await checkWishlistStatus();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Toast().fire({ title: "Operation Failed", icon: "error" });
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCart = async (
    courseId: number,
    userId: number,
    price: number,
    cartId: string
  ): Promise<void> => {
    setAddToCartBtn("Adding To Cart");
    try {
      const country = await GetCurrentAddress();
      const formdata = new FormData();
      formdata.append("course_id", courseId.toString());
      formdata.append("user_id", userId.toString());
      formdata.append("price", price.toString());
      formdata.append("country_name", country);
      formdata.append("cart_id", cartId);
      
      await useAxios.post(`course/cart/`, formdata);
      setAddToCartBtn("Added To Cart");
      Toast().fire({ title: "Added To Cart", icon: "success" });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddToCartBtn("Add To Cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-900">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buttonsCustom-600" />
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 md:p-6">
                <div className="mb-6 md:mb-8">
                  {/* Title and Category */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-fit">
                      <span className="inline-block bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 text-white text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
                        {course.category.title}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-buttonsCustom-900">
                      {course.title}
                    </h1>
                  </div>

                  {/* Tab Navigation - Scrollable on mobile */}
                  <div className="relative overflow-x-auto pb-2 -mb-2">
                    <nav className="flex space-x-4 md:space-x-8 border-b border-buttonsCustom-200 whitespace-nowrap">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "curriculum", label: "Curriculum" },
                        { id: "instructor", label: "Instructor" },
                        { id: "reviews", label: "Reviews" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative py-3 text-xs sm:text-sm font-medium transition-colors focus:outline-none ${
                            activeTab === tab.id
                              ? "text-buttonsCustom-600"
                              : "text-buttonsCustom-700 hover:text-buttonsCustom-900"
                          }`}
                        >
                          {tab.label}
                          {activeTab === tab.id && (
                            <motion.span
                              layoutId="activeTabIndicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-buttonsCustom-600"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
                
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 mt-6"
                  >
                    {/* Course Description */}
                    <div className="prose max-w-none text-buttonsCustom-800">
                      <div
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    </div>

                    {/* Course Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Course Details */}
                      <div className="bg-buttonsCustom-50 p-6 rounded-xl border border-buttonsCustom-200">
                        <h3 className="text-lg font-semibold text-buttonsCustom-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-buttonsCustom-700" />
                          Course Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Level</span>
                            <span className="font-medium capitalize text-buttonsCustom-900">
                              {course.level}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Language</span>
                            <span className="font-medium text-buttonsCustom-900">
                              {course.language}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Last Updated</span>
                            <span className="font-medium text-buttonsCustom-900">
                              {new Date(course.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Category</span>
                            <span className="font-medium text-buttonsCustom-900">
                              {course.category.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Student Statistics */}
                      <div className="bg-buttonsCustom-50 p-6 rounded-xl border border-buttonsCustom-200">
                        <h3 className="text-lg font-semibold text-buttonsCustom-900 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-buttonsCustom-700" />
                          Student Statistics
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Total Students</span>
                            <span className="font-medium text-buttonsCustom-900">
                              {course.students.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Average Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium text-buttonsCustom-900">
                                {course.average_rating?.toFixed(1) ?? '0'}/5
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-buttonsCustom-700">Total Reviews</span>
                            <span className="font-medium text-buttonsCustom-900">
                              {course.reviews.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Curriculum Preview */}
                    {course.curriculum.length > 0 && (
                      <div className="bg-white p-6 rounded-xl border border-buttonsCustom-200">
                        <h3 className="text-lg font-semibold text-buttonsCustom-900 mb-4 flex items-center gap-2">
                          <ListOrdered className="w-5 h-5 text-buttonsCustom-700" />
                          Curriculum Preview
                        </h3>
                        <div className="space-y-4">
                          {course.curriculum.slice(0, 3).map((module) => (
                            <div
                              key={module.variant_id}
                              className="border-l-2 border-buttonsCustom-300 pl-4"
                            >
                              <h4 className="font-medium text-buttonsCustom-900">
                                {module.title}
                              </h4>
                              <div className="text-sm text-buttonsCustom-700 mt-1">
                                {module.variant_items.map((item, index) => {
                                  const formatDuration = (duration: string) => {
                                    if (!duration) return "0 minutes";
                                    const parts = duration.split(":");
                                    const hours = parseInt(parts[0]);
                                    const minutes = parseInt(parts[1]);
                                    const seconds = parseInt(parts[2]);

                                    if (hours > 0) {
                                      return `${hours} hour${hours !== 1 ? "s" : ""}${
                                        minutes > 0
                                          ? ` ${minutes} minute${minutes !== 1 ? "s" : ""}`
                                          : ""
                                      }`;
                                    } else if (minutes > 0) {
                                      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
                                    } else {
                                      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
                                    }
                                  };

                                  return (
                                    <div
                                      key={`${item.title}-${index}`}
                                      className="flex items-center justify-between p-3 rounded-lg hover:bg-buttonsCustom-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        {item.preview ? (
                                          <PlayCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <Lock className="h-5 w-5 text-buttonsCustom-400" />
                                        )}
                                        <span className="text-buttonsCustom-800">
                                          {item.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {item.preview && (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 bg-green-50"
                                          >
                                            Preview
                                          </Badge>
                                        )}
                                        <span className="text-sm text-buttonsCustom-500">
                                          {formatDuration(item.duration)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          {course.curriculum.length > 3 && (
                            <div className="text-buttonsCustom-600 font-medium mt-2">
                              + {course.curriculum.length - 3} more modules
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "curriculum" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-4"
                  >
                    {course.curriculum.length > 0 ? (
                      course.curriculum.map((module) => (
                        <Collapsible key={module.variant_id}>
                          <div className="bg-white rounded-lg border border-buttonsCustom-200 overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <button className="w-full flex justify-between items-center px-6 py-4 hover:bg-buttonsCustom-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <ChevronDown className="h-5 w-5 text-buttonsCustom-400 transition-transform collapsible-[data-state=open]:rotate-180" />
                                  <div className="text-left">
                                    <h3 className="text-lg font-semibold text-buttonsCustom-900">
                                      {module.title}
                                    </h3>
                                    <p className="text-sm text-buttonsCustom-500 mt-1">
                                      {module.content_duration}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-buttonsCustom-50 text-buttonsCustom-600 border-buttonsCustom-300"
                                >
                                  {module.variant_items.length} lessons
                                </Badge>
                              </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="border-t border-buttonsCustom-100 px-6 py-4 space-y-3">
                                {module.variant_items.map((item, index) => {
                                  const formatDuration = (duration: string) => {
                                    if (!duration) return "0 minutes";
                                    const parts = duration.split(":");
                                    const hours = parseInt(parts[0]);
                                    const minutes = parseInt(parts[1]);
                                    const seconds = parseInt(parts[2]);

                                    if (hours > 0) {
                                      return `${hours} hour${hours !== 1 ? "s" : ""}${
                                        minutes > 0
                                          ? ` ${minutes} minute${minutes !== 1 ? "s" : ""}`
                                          : ""
                                      }`;
                                    } else if (minutes > 0) {
                                      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
                                    } else {
                                      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
                                    }
                                  };

                                  return (
                                    <div
                                      key={`${item.title}-${index}`}
                                      className="flex items-center justify-between p-3 rounded-lg hover:bg-buttonsCustom-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        {item.preview ? (
                                          <PlayCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <Lock className="h-5 w-5 text-buttonsCustom-400" />
                                        )}
                                        <span className="text-buttonsCustom-800">
                                          {item.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {item.preview && (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 bg-green-50"
                                          >
                                            Preview
                                          </Badge>
                                        )}
                                        <span className="text-sm text-buttonsCustom-500">
                                          {formatDuration(item.duration)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))
                    ) : (
                      <div className="text-center p-8 rounded-xl bg-buttonsCustom-50 border-2 border-dashed border-buttonsCustom-200">
                        <FileText className="w-12 h-12 text-buttonsCustom-400 mx-auto mb-4" />
                        <p className="text-buttonsCustom-700">
                          Curriculum details coming soon
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "instructor" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-white rounded-xl shadow-sm border border-buttonsCustom-200 p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-buttonsCustom-100">
                        <Image
                          src={course.teacher.image}
                          alt={course.teacher.full_name}
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-buttonsCustom-900">
                            {course.teacher.full_name}
                          </h3>
                          <p className="text-buttonsCustom-600 mt-1">
                            {course.teacher.bio}
                          </p>
                        </div>

                        <div className="flex gap-4">
                          {course.teacher.twitter && (
                            <a
                              href={course.teacher.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <Twitter className="w-6 h-6" />
                            </a>
                          )}
                          {course.teacher.facebook && (
                            <a
                              href={course.teacher.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Facebook className="w-6 h-6" />
                            </a>
                          )}
                          {course.teacher.linkedin && (
                            <a
                              href={course.teacher.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-900 transition-colors"
                            >
                              <Linkedin className="w-6 h-6" />
                            </a>
                          )}
                        </div>

                        <div className="pt-4 border-t border-buttonsCustom-100">
                          <h4 className="text-lg font-semibold text-buttonsCustom-900 mb-2">
                            About the Instructor
                          </h4>
                          <p className="text-buttonsCustom-700 leading-relaxed">
                            {course.teacher.about}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <div className="mt-8 space-y-8">
                    {course.reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-buttonsCustom-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                              <span className="text-buttonsCustom-600 font-medium">
                                {review.profile.full_name[0]}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-buttonsCustom-900">
                                  {review.profile.full_name}
                                </h4>
                                <p className="text-sm text-buttonsCustom-500">
                                  {new Date(review.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-5 h-5 ${
                                      star <= review.rating
                                        ? "text-yellow-400"
                                        : "text-buttonsCustom-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>

                            <p className="text-buttonsCustom-700 mt-2">
                              {review.review}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 sticky top-4"
              >
                {/* Media Container */}
                <div className="relative aspect-video w-full">
                  {course?.file ? (
                    <div className="relative h-full w-full">
                      <video
                        controls
                        controlsList="nodownload"
                        className="w-full h-full object-cover"
                        poster={course.image}
                      >
                        <source src={course.file} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={course?.image ?? "/fallback.jpg"}
                        alt={course?.title ?? "Course preview"}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </>
                  )}
                </div>

                {/* Pricing & CTA */}
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-buttonsCustom-900">
                      ₹ {course.price}
                      </span>
                      <span className="text-sm md:text-lg text-buttonsCustom-400 line-through">
                      ₹ 1700
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {addToCartBtn === "Add To Cart" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="col-span-2 sm:col-span-1 bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 hover:from-buttonsCustom-700 hover:to-buttonsCustom-800 text-white font-medium shadow-lg px-3 py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
                        onClick={() =>
                          addToCart(
                            course.id,
                            userId,
                            course.price,
                            CartId() || ""
                          )
                        }
                      >
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                        Add To Cart
                      </motion.button>
                    )}

                    {addToCartBtn === "Added To Cart" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        className="col-span-2 sm:col-span-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium shadow-lg px-6 py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
                        onClick={() =>
                          addToCart(
                            course.id,
                            userId,
                            course.price,
                            CartId() || ""
                          )
                        }
                      >
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        Added To Cart
                      </motion.button>
                    )}

                    {addToCartBtn === "Adding To Cart" && (
                      <button
                        type="button"
                        className="col-span-2 sm:col-span-1 bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-500 text-white font-medium shadow-lg px-6 py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base"
                        disabled
                      >
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        Adding To Cart
                      </button>
                    )}
                    
                    {/* Wishlist Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className={`col-span-2 sm:col-span-1 font-medium px-3 py-2.5 md:py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base border ${
                        isWishlisted 
                          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" 
                          : "border-buttonsCustom-200 bg-buttonsCustom-50 text-buttonsCustom-700 hover:bg-buttonsCustom-100"
                      }`}
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? (
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      ) : (
                        <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                      )}
                      {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                    </motion.button>
                  </div>

                  {/* Course Meta */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 p-2.5 md:p-3 bg-buttonsCustom-50 rounded-lg border border-buttonsCustom-200">
                      <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-buttonsCustom-700" />
                      <div>
                        <p className="text-xs md:text-sm text-buttonsCustom-700">Lectures</p>
                        <p className="text-sm md:text-base font-medium text-buttonsCustom-900">
                          {course.curriculum.reduce(
                            (total, module) =>
                              total + module.variant_items.length,
                            0
                          )}{" "}
                          total lessons
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 md:p-3 bg-buttonsCustom-50 rounded-lg border border-buttonsCustom-200">
                      <BarChart2 className="w-4 h-4 md:w-5 md:h-5 text-buttonsCustom-700" />
                      <div>
                        <p className="text-xs md:text-sm text-buttonsCustom-700">Level</p>
                        <p className="text-sm md:text-base font-medium text-buttonsCustom-900 capitalize">{course.level}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 md:p-3 bg-buttonsCustom-50 rounded-lg border border-buttonsCustom-200">
                      <Globe className="w-4 h-4 md:w-5 md:h-5 text-buttonsCustom-700" />
                      <div>
                        <p className="text-xs md:text-sm text-buttonsCustom-700">Language</p>
                        <p className="text-sm md:text-base font-medium text-buttonsCustom-900">{course.language}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 md:p-3 bg-buttonsCustom-50 rounded-lg border border-buttonsCustom-200">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-buttonsCustom-700" />
                      <div>
                        <p className="text-xs md:text-sm text-buttonsCustom-700">Last Updated</p>
                        <p className="text-sm md:text-base font-medium text-buttonsCustom-900">
                          {new Date(course.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <p className="text-center text-buttonsCustom-700">Course not found</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;