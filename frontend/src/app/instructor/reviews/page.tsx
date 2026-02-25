"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Star, 
  StarHalf, 
  Search, 
  Flag, 
  ArrowRight, 
  Send, 
  MessageCircle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import { teacherId } from "@/utils/constants";
import Toast from "@/views/plugins/Toast";

interface Profile {
  id: string;
  full_name: string;
  image: string;
}

interface Course {
  id: string;
  title: string;
}

interface Review {
  id: string;
  profile: Profile;
  course: Course;
  rating: number;
  review: string;
  reply: string;
  date: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reply, setReply] = useState("");
  const [filteredReviews, setFilteredReview] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviewsData = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(`teacher/review-lists/${teacherId}/`);
      setReviews(response.data);
      setFilteredReview(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleSubmitReply = async (reviewId: string) => {
    try {
      await useAxios.patch(`teacher/review-detail/${teacherId}/${reviewId}/`, {
        reply: reply,
      });
      fetchReviewsData();
      Toast().fire({
        icon: "success",
        title: "Reply sent successfully",
      });
      setReply("");
    } catch (error) {
      console.error("Error submitting reply:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to send reply",
      });
    }
  };

  const handleSortByDate = (value: string) => {
    const sortedReview = [...filteredReviews];
    if (value === "newest") {
      sortedReview.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (value === "oldest") {
      sortedReview.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    setFilteredReview(sortedReview);
  };

  const handleSortByRatingChange = (value: string) => {
    const rating = parseInt(value);
    if (rating === 0) {
      setFilteredReview(reviews);
    } else {
      const filtered = reviews.filter((review) => review.rating === rating);
      setFilteredReview(filtered);
    }
  };

  const handleFilterByCourse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
      setFilteredReview(reviews);
    } else {
      const filtered = reviews.filter((review) => 
        review.course?.title.toLowerCase().includes(query)
      );
      setFilteredReview(filtered);
    }
  };

  // Custom star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-amber-500 text-amber-500" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-amber-500 text-amber-500" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return <div className="flex">{stars}</div>;
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
                <MessageCircle className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Reviews</h4>
                <p className="text-sm text-gray-500">Manage student feedback and responses</p>
              </div>
            </motion.div>
            
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Student Reviews</CardTitle>
                    <p className="text-sm text-buttonsCustom-500 mt-1">
                      Manage and respond to student reviews of your courses
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
                      <Input
                        type="search"
                        placeholder="Search by course name"
                        onChange={handleFilterByCourse}
                        className="pl-10 border-buttonsCustom-200 focus:border-buttonsCustom-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Select onValueChange={handleSortByRatingChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select onValueChange={handleSortByDate}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buttonsCustom-600" />
                  </div>
                ) : filteredReviews.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg overflow-hidden"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                                <Image
                                  src={review.profile.image}
                                  alt={review.profile.full_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{review.profile.full_name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(review.date), "dd MMM, yyyy")}
                                  </div>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Flag className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mt-2 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <StarRating rating={review.rating} />
                                  <span className="text-sm text-gray-500">for</span>
                                  <Badge variant="outline" className="bg-buttonsCustom-50 text-buttonsCustom-700 border-buttonsCustom-200">
                                    {review.course?.title}
                                  </Badge>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    <span>Review</span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600">{review.review}</p>
                                </div>
                                
                                {review.reply && (
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                      <ArrowRight className="h-3.5 w-3.5" />
                                      <span>Your Response</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{review.reply}</p>
                                  </div>
                                )}
                                
                                <Collapsible className="w-full">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm" className="mt-2">
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      {review.reply ? "Update Response" : "Send Response"}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3">
                                    <div className="space-y-3">
                                      <Textarea 
                                        placeholder="Write your response here..." 
                                        className="min-h-[100px]"
                                        value={reply} 
                                        onChange={(e) => setReply(e.target.value)}
                                      />
                                      <Button 
                                        onClick={() => handleSubmitReply(review.id)}
                                        disabled={!reply.trim()}
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Response
                                      </Button>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No reviews found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      There are no reviews matching your search criteria
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
