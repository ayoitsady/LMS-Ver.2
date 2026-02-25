"use client"

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { BookOpen, PlusCircle, FileText, Edit, Trash, BarChart3 } from "lucide-react";
import InstructorSidebar from '@/components/instructor/Sidebar';
import InstructorHeader from '@/components/instructor/Header';
import useAxios from '@/utils/axios';
import UserData from '@/views/plugins/UserData';
import Toast from '@/views/plugins/Toast';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import type { AxiosError } from 'axios';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  course_id: string;
  slug?: string;
  title: string;
  image: string;
  language: string;
  level: string;
  price: number;
  students: { id: string; name: string }[];
  date: string;
  platform_status: string;
  teacher_course_status: string;
}

interface QuizQuestion {
  // Define minimal structure for now; can be expanded later
  quiz_question_id: string;
  question_text: string;
  points: number;
  order: number;
  options: QuizQuestionOption[];
}

interface QuizQuestionOption {
  quiz_question_option_id: string;
  option_text: string;
  is_correct: boolean;
}

interface Quiz {
  quiz_id: string;
  course_id: string;
  teacher: number;
  title: string;
  description: string;
  time_limit: number;
  shuffle_questions: boolean;
  min_pass_points: number;
  max_attempts: number;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

const QuizManagePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [errorCourses, setErrorCourses] = useState<string | null>(null);
  const [errorQuizzes, setErrorQuizzes] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    time_limit: 20,
    shuffle_questions: true,
    min_pass_points: 5,
    max_attempts: 3,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    time_limit: 20,
    shuffle_questions: true,
    min_pass_points: 5,
    max_attempts: 3,
  });
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch courses on mount (using teacher id)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setErrorCourses(null);
      try {
        const teacherId = UserData()?.teacher_id;
        if (!teacherId) throw new Error('No teacher ID found');
        const res = await useAxios.get(`teacher/course-lists/${teacherId}/`);
        setCourses(res.data || []);
      } catch {
        setErrorCourses('Failed to load courses.');
        Toast().fire({ title: 'Failed to fetch courses', icon: 'error' });
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch quizzes when a course is selected
  const fetchQuizzes = async (courseId: string) => {
    setLoadingQuizzes(true);
    setErrorQuizzes(null);
    try {
      const res = await useAxios.get(`quiz/course/${courseId}/`);
      setQuizzes(res.data || []);
    } catch {
      setErrorQuizzes('Failed to load quizzes.');
      Toast().fire({ title: 'Failed to fetch quizzes', icon: 'error' });
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse) {
      setQuizzes([]);
      return;
    }
    fetchQuizzes(selectedCourse);
  }, [selectedCourse]);

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === 'checkbox'
    ) {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle switch (for shuffle_questions)
  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, shuffle_questions: checked }));
  };

  // Handle create quiz submit
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...form,
        course_id: selectedCourse,
        time_limit: Number(form.time_limit),
        min_pass_points: Number(form.min_pass_points),
        max_attempts: Number(form.max_attempts),
      };
      console.log('Quiz Create Payload:', payload);
      await useAxios.post('/quiz/create/', payload);
      Toast().fire({ title: 'Quiz created successfully!', icon: 'success' });
      setOpenCreate(false);
      setForm({
        title: '',
        description: '',
        time_limit: 20,
        shuffle_questions: true,
        min_pass_points: 5,
        max_attempts: 3,
      });
      // Refresh quizzes
      fetchQuizzes(selectedCourse);
    } catch (err: unknown) {
      let errorMsg = 'Failed to create quiz.';
      if (
        typeof err === 'object' &&
        err !== null &&
        'isAxiosError' in err &&
        (err as AxiosError).isAxiosError &&
        (err as AxiosError<{ error?: string }>).response?.data?.error === 'Quiz already exists for this course'
      ) {
        errorMsg = 'Only one quiz is allowed per course. Delete the existing quiz to create a new one.';
      }
      setFormError(errorMsg);
      Toast().fire({ title: errorMsg, icon: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // Handle quiz delete
  const handleDeleteQuiz = (quiz: Quiz) => {
    setDeletingQuiz(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuiz) return;
    setIsDeleting(true);
    try {
      await useAxios.delete(`quiz/${deletingQuiz.quiz_id}/delete/`);
      Toast().fire({ title: `Quiz "${deletingQuiz.title}" deleted successfully`, icon: 'success' });
      setDeletingQuiz(null);
      setIsDeleteDialogOpen(false);
      // Refresh quizzes
      fetchQuizzes(selectedCourse);
    } catch {
      Toast().fire({ title: 'Failed to delete quiz', icon: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit modal and pre-fill form
  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      title: quiz.title,
      description: quiz.description,
      time_limit: quiz.time_limit,
      shuffle_questions: quiz.shuffle_questions,
      min_pass_points: quiz.min_pass_points,
      max_attempts: quiz.max_attempts,
    });
    setEditFormError(null);
    setOpenEdit(true);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === 'checkbox'
    ) {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle switch for shuffle_questions in edit
  const handleEditSwitchChange = (checked: boolean) => {
    setEditForm((prev) => ({ ...prev, shuffle_questions: checked }));
  };

  // Handle edit quiz submit
  const handleEditQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError(null);
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setEditFormError('Title and description are required.');
      return;
    }
    if (!editingQuiz) return;
    setEditing(true);
    try {
      const payload = {
        ...editForm,
        time_limit: Number(editForm.time_limit),
        min_pass_points: Number(editForm.min_pass_points),
        max_attempts: Number(editForm.max_attempts),
      };
      await useAxios.put(`quiz/${editingQuiz.quiz_id}/update/`, payload);
      Toast().fire({ title: 'Quiz updated successfully!', icon: 'success' });
      setOpenEdit(false);
      setEditingQuiz(null);
      // Refresh quizzes
      fetchQuizzes(selectedCourse);
    } catch {
      setEditFormError('Failed to update quiz.');
      Toast().fire({ title: 'Failed to update quiz', icon: 'error' });
    } finally {
      setEditing(false);
    }
  };

  // Navigate to question management page for a quiz
  const handleManageQuestions = (quiz: Quiz) => {
    router.push(`/instructor/quiz-manage/${quiz.quiz_id}/questions/`);
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
                <BookOpen className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Quiz Management</h4>
                <p className="text-sm text-gray-500">Create and manage quizzes for your courses</p>
              </div>
            </motion.div>
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Quizzes</CardTitle>
                    <p className="text-sm text-buttonsCustom-500 mt-1">
                      Manage quizzes for your selected course
                    </p>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Select Course:</label>
                    {loadingCourses ? (
                      <div>Loading courses...</div>
                    ) : errorCourses ? (
                      <div className="text-red-500">{errorCourses}</div>
                    ) : (
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-64 border-buttonsCustom-200 focus:ring-buttonsCustom-600 focus:border-buttonsCustom-600">
                          <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.course_id} value={course.course_id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                  {selectedCourse && (
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition mb-4 flex items-center gap-2"
                          disabled={quizzes.length > 0}
                        >
                          <PlusCircle className="w-5 h-5" /> Create New Quiz
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Quiz</DialogTitle>
                          <DialogDescription>Fill in the quiz details below.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateQuiz} className="space-y-4">
                          <div>
                            <label className="block mb-1 font-medium">Title</label>
                            <Input
                              name="title"
                              value={form.title}
                              onChange={handleFormChange}
                              required
                              placeholder="Quiz Title"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Description</label>
                            <textarea
                              name="description"
                              value={form.description}
                              onChange={handleFormChange}
                              required
                              placeholder="Quiz Description"
                              className="w-full border rounded px-3 py-2"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block mb-1 font-medium">Time Limit (minutes)</label>
                              <Input
                                name="time_limit"
                                type="number"
                                min={1}
                                value={form.time_limit}
                                onChange={handleFormChange}
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block mb-1 font-medium">Min Pass Points</label>
                              <Input
                                name="min_pass_points"
                                type="number"
                                min={1}
                                value={form.min_pass_points}
                                onChange={handleFormChange}
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block mb-1 font-medium">Max Attempts</label>
                              <Input
                                name="max_attempts"
                                type="number"
                                min={1}
                                value={form.max_attempts}
                                onChange={handleFormChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="font-medium">Shuffle Questions</label>
                            <Switch
                              checked={form.shuffle_questions}
                              onCheckedChange={handleSwitchChange}
                            />
                          </div>
                          {formError && <div className="text-red-500 text-sm">{formError}</div>}
                          <DialogFooter>
                            <Button type="submit" disabled={creating} className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold">
                              {creating ? 'Creating...' : 'Create Quiz'}
                            </Button>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  {selectedCourse && (
                    loadingQuizzes ? (
                      <div className="py-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buttonsCustom-600" />
                      </div>
                    ) : errorQuizzes ? (
                      <div className="text-red-500">{errorQuizzes}</div>
                    ) : quizzes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-12 h-12 text-buttonsCustom-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
                        <p className="text-sm text-gray-500 mb-4">Create your first quiz for this course to get started.</p>
                        <Button onClick={() => setOpenCreate(true)} className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2">
                          <PlusCircle className="w-5 h-5" /> Create Quiz
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg shadow border border-buttonsCustom-100 bg-white/80">
                        <div className="flex items-center justify-between px-4 py-2 bg-yellow-50 border-b border-yellow-200 rounded-t-lg mb-2">
                          <span className="text-yellow-700 text-sm font-medium">
                            Only one quiz is allowed per course. To create a new quiz, delete the existing one first.
                          </span>
                        </div>
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-buttonsCustom-50 to-buttonsCustom-100 text-buttonsCustom-900">
                              <th className="p-3 text-left font-semibold">Title</th>
                              <th className="p-3 text-left font-semibold">Description</th>
                              <th className="p-3 text-center font-semibold">Time Limit</th>
                              <th className="p-3 text-center font-semibold">Max Attempts</th>
                              <th className="p-3 text-center font-semibold">Min Pass Points</th>
                              <th className="p-3 text-center font-semibold">Questions</th>
                              <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizzes.map(quiz => (
                              <tr key={quiz.quiz_id} className="border-t border-buttonsCustom-100 hover:bg-buttonsCustom-50/50 transition">
                                <td className="p-3 text-gray-900 font-medium">{quiz.title}</td>
                                <td className="p-3 text-gray-700">{quiz.description}</td>
                                <td className="p-3 text-center text-blue-700 font-semibold">{quiz.time_limit} min</td>
                                <td className="p-3 text-center">
                                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                    {quiz.max_attempts}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                                    {quiz.min_pass_points}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">
                                    {quiz.questions?.length ?? 0}
                                  </span>
                                </td>
                                <td className="p-3 flex flex-wrap gap-2 justify-center">
                                  <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200 transition font-semibold flex items-center gap-1 px-3 py-1 rounded" onClick={() => handleEditQuiz(quiz)}>
                                    <Edit className="w-4 h-4" /> Edit
                                  </Button>
                                  <Button size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-semibold flex items-center gap-1 px-3 py-1 rounded" onClick={() => handleManageQuestions(quiz)}>
                                    <FileText className="w-4 h-4" /> Manage Questions
                                  </Button>
                                  <AlertDialog open={isDeleteDialogOpen && deletingQuiz?.quiz_id === quiz.quiz_id} onOpenChange={setIsDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        className="bg-red-100 text-red-700 hover:bg-red-200 transition font-semibold flex items-center gap-1 px-3 py-1 rounded"
                                        onClick={() => handleDeleteQuiz(quiz)}
                                        disabled={isDeleting}
                                      >
                                        <Trash className="w-4 h-4" /> Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                          <Trash className="h-5 w-5" />
                                          Delete Quiz
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete <span className="font-medium">{deletingQuiz?.title}</span>?<br />
                                          <span className="text-red-500">This action cannot be undone. All quiz questions and data will be permanently removed.</span>
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
                                            "Delete Quiz"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <a href={`/instructor/quiz-manage/${quiz.quiz_id}/analytics/`}>
                                    <Button size="sm" className="bg-orange-100 text-orange-700 hover:bg-orange-200 transition font-semibold flex items-center gap-1 px-3 py-1 rounded">
                                      <BarChart3 className="w-4 h-4" /> View Analytics
                                    </Button>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Edit Quiz Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>Update the quiz details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditQuizSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <Input
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                required
                placeholder="Quiz Title"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                required
                placeholder="Quiz Description"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Time Limit (minutes)</label>
                <Input
                  name="time_limit"
                  type="number"
                  min={1}
                  value={editForm.time_limit}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Min Pass Points</label>
                <Input
                  name="min_pass_points"
                  type="number"
                  min={1}
                  value={editForm.min_pass_points}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Max Attempts</label>
                <Input
                  name="max_attempts"
                  type="number"
                  min={1}
                  value={editForm.max_attempts}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Shuffle Questions</label>
              <Switch
                checked={editForm.shuffle_questions}
                onCheckedChange={handleEditSwitchChange}
              />
            </div>
            {editFormError && <div className="text-red-500 text-sm">{editFormError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={editing} className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold">
                {editing ? 'Saving...' : 'Save Changes'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManagePage; 