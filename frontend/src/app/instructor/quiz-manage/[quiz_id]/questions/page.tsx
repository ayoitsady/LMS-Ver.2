"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InstructorSidebar from '@/components/instructor/Sidebar';
import InstructorHeader from '@/components/instructor/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Pencil, Trash2 } from "lucide-react";
import useAxios from '@/utils/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Toast from '@/views/plugins/Toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';

interface QuizQuestionOption {
  quiz_question_option_id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  quiz_question_id: string;
  question_text: string;
  points: number;
  order: number;
  options: QuizQuestionOption[];
}

// Type guard for API errors
function isApiError(obj: unknown): obj is { response: { status: number; data: { message?: string } } } {
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

export default function QuizQuestionsPage() {
  const params = useParams();
  const quiz_id = params.quiz_id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(1);
  const [order, setOrder] = useState(questions.length + 1);
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editPoints, setEditPoints] = useState(1);
  const [editOrder, setEditOrder] = useState(1);
  const [editOptions, setEditOptions] = useState([
    { option_text: '', is_correct: false, quiz_question_option_id: '' },
    { option_text: '', is_correct: false, quiz_question_option_id: '' },
  ]);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Fetch questions for the quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Optionally fetch quiz details for title
        // const quizRes = await useAxios.get(`quiz/${quiz_id}/`);
        // setQuizTitle(quizRes.data.title);
        const res = await useAxios.get(`quiz/${quiz_id}/questions/`);
        setQuestions(res.data || []);
      } catch {
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quiz_id]);

  // Helper to reset add form
  const resetAddForm = () => {
    setQuestionText('');
    setPoints(1);
    setOrder(questions.length + 1);
    setOptions([
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ]);
    setAddError(null);
  };

  // Add Question handler
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    // Validation
    if (!questionText.trim()) return setAddError('Question text is required.');
    if (!points || points < 1) return setAddError('Points must be at least 1.');
    if (!order || order < 1) return setAddError('Order must be at least 1.');
    if (options.length < 2) return setAddError('At least 2 options are required.');
    if (options.some(opt => !opt.option_text.trim())) return setAddError('All option texts are required.');
    if (!options.some(opt => opt.is_correct)) return setAddError('Select the correct answer.');
    setAddLoading(true);
    try {
      await useAxios.post(`quiz/question/create/`, {
        quiz_id,
        question_text: questionText,
        points,
        order,
        options,
      });
      resetAddForm(); // Reset form for rapid entry
      // Refresh questions
      setLoading(true);
      const res = await useAxios.get(`quiz/${quiz_id}/questions/`);
      setQuestions(res.data || []);
      Toast().fire({ icon: 'success', title: 'Question added successfully!' });
    } catch (error: unknown) {
      if (isApiError(error) && error.response.data && typeof error.response.data.message === 'string') {
        setAddError(error.response.data.message);
      } else {
        setAddError('Failed to add question.');
      }
    } finally {
      setAddLoading(false);
      setLoading(false);
    }
  };

  // Option handlers
  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => i === idx ? { ...opt, option_text: value } : opt));
  };
  const handleOptionCorrect = (idx: number) => {
    setOptions(opts => opts.map((opt, i) => ({ ...opt, is_correct: i === idx })));
  };
  const handleAddOption = () => {
    setOptions(opts => [...opts, { option_text: '', is_correct: false }]);
  };
  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(opts => opts.filter((_, i) => i !== idx));
  };

  // Open edit modal with question data
  const openEditModal = (q: QuizQuestion) => {
    setEditQuestionId(q.quiz_question_id);
    setEditQuestionText(q.question_text);
    setEditPoints(q.points);
    setEditOrder(q.order);
    setEditOptions(q.options.map(opt => ({
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      quiz_question_option_id: opt.quiz_question_option_id || '',
    })));
    setEditError(null);
    setEditOpen(true);
  };

  // Edit handlers
  const handleEditOptionChange = (idx: number, value: string) => {
    setEditOptions(opts => opts.map((opt, i) => i === idx ? { ...opt, option_text: value } : opt));
  };
  const handleEditOptionCorrect = (idx: number) => {
    setEditOptions(opts => opts.map((opt, i) => ({ ...opt, is_correct: i === idx })));
  };
  const handleEditAddOption = () => {
    setEditOptions(opts => [...opts, { option_text: '', is_correct: false, quiz_question_option_id: '' }]);
  };
  const handleEditRemoveOption = (idx: number) => {
    if (editOptions.length <= 2) return;
    setEditOptions(opts => opts.filter((_, i) => i !== idx));
  };

  // Edit submit
  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    if (!editQuestionText.trim()) return setEditError('Question text is required.');
    if (!editPoints || editPoints < 1) return setEditError('Points must be at least 1.');
    if (!editOrder || editOrder < 1) return setEditError('Order must be at least 1.');
    if (editOptions.length < 2) return setEditError('At least 2 options are required.');
    if (editOptions.some(opt => !opt.option_text.trim())) return setEditError('All option texts are required.');
    if (!editOptions.some(opt => opt.is_correct)) return setEditError('Select the correct answer.');
    setEditLoading(true);
    try {
      await useAxios.put(`quiz/question/${editQuestionId}/update/`, {
        question_text: editQuestionText,
        points: editPoints,
        order: editOrder,
        options: editOptions,
      });
      setEditOpen(false);
      setEditQuestionId(null);
      setEditQuestionText('');
      setEditPoints(1);
      setEditOrder(1);
      setEditOptions([
        { option_text: '', is_correct: false, quiz_question_option_id: '' },
        { option_text: '', is_correct: false, quiz_question_option_id: '' },
      ]);
      setLoading(true);
      const res = await useAxios.get(`quiz/${quiz_id}/questions/`);
      setQuestions(res.data || []);
      Toast().fire({ icon: 'success', title: 'Question updated successfully!' });
    } catch (error: unknown) {
      if (isApiError(error) && error.response.data && typeof error.response.data.message === 'string') {
        setEditError(error.response.data.message);
      } else {
        setEditError('Failed to update question.');
      }
    } finally {
      setEditLoading(false);
      setLoading(false);
    }
  };

  // Delete handlers
  const openDeleteDialog = (questionId: string) => {
    setDeleteQuestionId(questionId);
    setDeleteOpen(true);
  };
  const handleDeleteQuestion = async () => {
    setDeleteLoading(true);
    try {
      await useAxios.delete(`quiz/question/${deleteQuestionId}/delete/`);
      setDeleteOpen(false);
      setDeleteQuestionId(null);
      setLoading(true);
      const res = await useAxios.get(`quiz/${quiz_id}/questions/`);
      setQuestions(res.data || []);
      Toast().fire({ icon: 'success', title: 'Question deleted successfully!' });
    } catch {
      Toast().fire({ icon: 'error', title: 'Failed to delete question.' });
    } finally {
      setDeleteLoading(false);
      setLoading(false);
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
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Manage Questions</h4>
                <p className="text-sm text-gray-500">Add, edit, and delete questions for this quiz</p>
              </div>
            </div>
            <div className="flex justify-end mb-2">
              <Button onClick={() => { setAddOpen(true); resetAddForm(); }} variant="default" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-semibold shadow">+ Add Question</Button>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div>
                    <Label htmlFor="questionText">Question Text</Label>
                    <Input id="questionText" value={questionText} onChange={e => setQuestionText(e.target.value)} required disabled={addLoading} className="mt-1" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="points">Points</Label>
                      <Input id="points" type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} required disabled={addLoading} className="mt-1" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="order">Order</Label>
                      <Input id="order" type="number" min={1} value={order} onChange={e => setOrder(Number(e.target.value))} required disabled={addLoading} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2 mt-1">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={opt.option_text}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            required
                            disabled={addLoading}
                            className="flex-1"
                          />
                          <label className="flex items-center gap-1 text-xs text-green-700">
                            <input
                              type="radio"
                              name="add-correct-option"
                              checked={opt.is_correct}
                              onChange={() => handleOptionCorrect(idx)}
                              disabled={addLoading}
                            /> Correct
                          </label>
                          {options.length > 2 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveOption(idx)} disabled={addLoading} className="text-red-500">Remove</Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={handleAddOption} disabled={addLoading} className="mt-1">+ Add Option</Button>
                    </div>
                  </div>
                  {addError && <div className="text-red-600 text-sm text-center">{addError}</div>}
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} disabled={addLoading}>Done</Button>
                    <Button type="submit" variant="default" className="bg-buttonsCustom-600 text-white" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add & Next'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">
                  {quizTitle ? quizTitle : `Quiz #${quiz_id}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">Loading questions...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : questions.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No questions found for this quiz.</div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((q) => (
                      <Card key={q.quiz_question_id} className="border border-buttonsCustom-100 bg-white/95 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-buttonsCustom-900">Q{q.order}.</span>
                            <span className="text-gray-900 font-medium">{q.question_text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{q.points} pts</span>
                            <Button size="icon" variant="ghost" onClick={() => openEditModal(q)} title="Edit question"><Pencil className="w-4 h-4 text-buttonsCustom-600" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(q.quiz_question_id)} title="Delete question"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pl-8 pb-4">
                          <ul className="space-y-1">
                            {q.options.map(opt => (
                              <li key={opt.quiz_question_option_id} className="flex items-center gap-2">
                                <span className={`inline-block w-2 h-2 rounded-full ${opt.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className={opt.is_correct ? 'font-semibold text-green-700' : ''}>{opt.option_text}</span>
                                {opt.is_correct && <span className="ml-2 text-xs text-green-600 font-bold">(Correct)</span>}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="mt-8">
                  <a href="/instructor/quiz-manage/">
                    <Button variant="outline">Back to Quizzes</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
            {/* Edit Question Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle>Edit Question</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditQuestion} className="space-y-4">
                  <div>
                    <Label htmlFor="editQuestionText">Question Text</Label>
                    <Input id="editQuestionText" value={editQuestionText} onChange={e => setEditQuestionText(e.target.value)} required disabled={editLoading} className="mt-1" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="editPoints">Points</Label>
                      <Input id="editPoints" type="number" min={1} value={editPoints} onChange={e => setEditPoints(Number(e.target.value))} required disabled={editLoading} className="mt-1" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="editOrder">Order</Label>
                      <Input id="editOrder" type="number" min={1} value={editOrder} onChange={e => setEditOrder(Number(e.target.value))} required disabled={editLoading} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2 mt-1">
                      {editOptions.map((opt, idx) => (
                        <div key={opt.quiz_question_option_id || idx} className="flex items-center gap-2">
                          <Input
                            value={opt.option_text}
                            onChange={e => handleEditOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            required
                            disabled={editLoading}
                            className="flex-1"
                          />
                          <label className="flex items-center gap-1 text-xs text-green-700">
                            <input
                              type="radio"
                              name="edit-correct-option"
                              checked={opt.is_correct}
                              onChange={() => handleEditOptionCorrect(idx)}
                              disabled={editLoading}
                            /> Correct
                          </label>
                          {editOptions.length > 2 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => handleEditRemoveOption(idx)} disabled={editLoading} className="text-red-500">Remove</Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={handleEditAddOption} disabled={editLoading} className="mt-1">+ Add Option</Button>
                    </div>
                  </div>
                  {editError && <div className="text-red-600 text-sm text-center">{editError}</div>}
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={editLoading}>Cancel</Button>
                    <Button type="submit" variant="default" className="bg-buttonsCustom-600 text-white" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="py-2">Are you sure you want to delete this question? This action cannot be undone.</div>
                <AlertDialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteQuestion} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
} 