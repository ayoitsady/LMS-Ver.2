"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Search, 
  Send, 
  ArrowRight,
  MessageCircle,
  User,
  Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";

interface Profile {
  full_name: string;
  image: string;
}

interface Message {
  id: string;
  message: string;
  date: string;
  profile: Profile;
}

interface Question {
  qa_id: string;
  title: string;
  date: string;
  course: string;
  profile: Profile;
  messages: Message[];
}

export default function QuestionAnswer() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const lastElementRef = useRef<HTMLDivElement>(null);
  const [createMessage, setCreateMessage] = useState({
    message: "",
  });

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(`teacher/question-answer-list/${UserData()?.teacher_id}/`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenConversation = (conversation: Question) => {
    setSelectedConversation(conversation);
    setIsDialogOpen(true);
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCreateMessage({
      ...createMessage,
      [event.target.name]: event.target.value,
    });
  };

  const sendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConversation || !createMessage.message.trim()) return;
    
    const formdata = new FormData();
    formdata.append("course_id", selectedConversation.course);
    formdata.append("user_id", String(UserData()?.user_id || ""));
    formdata.append("message", createMessage.message);
    formdata.append("qa_id", selectedConversation.qa_id);

    try {
      const response = await useAxios.post(`student/question-answer-message-create/`, formdata);
      setSelectedConversation(response.data.question);
      setCreateMessage({ message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (lastElementRef.current && isDialogOpen) {
      setTimeout(() => {
        lastElementRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedConversation, isDialogOpen]);

  const handleSearchQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchQuestions();
    } else {
      const filtered = questions.filter((question) => {
        return question.title.toLowerCase().includes(query);
      });
      setQuestions(filtered);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
                <MessageSquare className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Question & Answer</h4>
                <p className="text-sm text-gray-500">Manage student questions and discussions</p>
              </div>
            </motion.div>
            
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Discussion Forum</CardTitle>
                    <CardDescription className="text-buttonsCustom-500 mt-1">
                      Answer student questions and participate in discussions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search questions..." 
                    className="pl-10 border-gray-200 focus:border-buttonsCustom-400"
                    onChange={handleSearchQuestion}
                  />
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-3 flex-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-9 w-40" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : questions.length > 0 ? (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <motion.div
                          key={question.qa_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/50 hover:bg-white/80 transition-colors duration-200 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                              <AvatarImage src={question.profile.image} alt={question.profile.full_name} />
                              <AvatarFallback className="bg-buttonsCustom-100 text-buttonsCustom-700">
                                {getInitials(question.profile.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center">
                                      <User className="h-3.5 w-3.5 mr-1" />
                                      {question.profile.full_name}
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="h-3.5 w-3.5 mr-1" />
                                      {format(new Date(question.date), "dd MMM, yyyy")}
                                    </span>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      {question.messages?.length || 0}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Button 
                                  onClick={() => handleOpenConversation(question)}
                                  className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white"
                                >
                                  Join Conversation
                                  <ArrowRight className="h-4 w-4 ml-2" />
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
                      <MessageSquare className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No questions yet</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      When students ask questions about your courses, they&apos;ll appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conversation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-buttonsCustom-600" />
              {selectedConversation?.title}
            </DialogTitle>
            <DialogDescription>
              Conversation with {selectedConversation?.profile.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedConversation?.messages?.map((message, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="h-10 w-10 border border-white shadow-sm flex-shrink-0">
                    <AvatarImage 
                      src={message.profile.image?.startsWith("http://127.0.0.1:8000") 
                        ? message.profile.image 
                        : `http://127.0.0.1:8000${message.profile.image}`} 
                      alt={message.profile.full_name} 
                    />
                    <AvatarFallback className="bg-buttonsCustom-100 text-buttonsCustom-700">
                      {getInitials(message.profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h6 className="font-medium text-gray-900">{message.profile.full_name}</h6>
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.date), "dd MMM, yyyy")}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={lastElementRef}></div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <form onSubmit={sendNewMessage} className="flex w-full gap-2">
              <Textarea 
                name="message" 
                value={createMessage.message}
                onChange={handleMessageChange}
                placeholder="Type your reply..." 
                className="min-h-[80px] flex-1 resize-none border-gray-200"
              />
              <Button type="submit" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white h-auto">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
