"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Loader, Send, Timer } from 'lucide-react';

import apiInstance from '@/utils/axios';
import UserData from '@/views/plugins/UserData';
import Toast from '@/views/plugins/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import StudentHeader from '@/components/student/Header';

interface QuizOption {
    quiz_question_option_id: string;
    option_text: string;
}

interface QuizQuestion {
    quiz_question_id: string;
    question_text: string;
    options: QuizOption[];
}

interface Quiz {
    quiz_id: string;
    title: string;
    description: string;
    time_limit: number;
    shuffle_questions: boolean;
    questions: QuizQuestion[];
    min_pass_points: number;
}

const QuizTakePage = () => {
    const params = useParams();
    const router = useRouter();

    const quizId = params.quiz_id as string;
    const userId = UserData()?.user_id;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

    const fetchQuiz = useCallback(async () => {
        if (!quizId) return;
        setLoading(true);
        try {
            console.log('Fetching quiz with ID:', quizId);
            // Try different endpoint patterns
            const response = await apiInstance.get<Quiz>(`quiz/${quizId}/take`);
            console.log('Quiz API Response:', response.data);
            const quizData = response.data;
            
            // Shuffle questions if shuffle_questions is true
            if (quizData.shuffle_questions && quizData.questions) {
                const shuffledQuestions = [...quizData.questions].sort(() => Math.random() - 0.5);
                quizData.questions = shuffledQuestions;
            }
            
            setQuiz(quizData);
            setTimeLeft(quizData.time_limit * 60);
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError('Failed to load the quiz. Please try again later.');
            Toast().fire({ icon: 'error', title: 'Could not load quiz.' });
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        setIsSubmitConfirmOpen(false);
        try {
            const payload = {
                quiz_id: quizId,
                answers: Object.entries(answers).map(([question_id, option_id]) => ({
                    question_id,
                    selected_option_id: option_id
                }))
            };

            console.log('Submitting quiz with payload:', payload);
            const response = await apiInstance.post(`quiz/attempt/create/`, payload);
            console.log('Submission response:', response.data);
            
            // The response should contain the attempt_id
            const attemptId = response.data.attempt_id;
            
            Toast().fire({ icon: 'success', title: 'Quiz submitted successfully!' });

            // Redirect to the result page
            router.push(`/student/quiz/result/${attemptId}`);

        } catch (err) {
            console.error('Error submitting quiz:', err);
            setError('An error occurred while submitting the quiz.');
            Toast().fire({ icon: 'error', title: 'Submission failed.' });
            setSubmitting(false);
        }
    }, [answers, quizId, userId, router]);

    // Timer countdown effect
    useEffect(() => {
        if (loading || timeLeft <= 0 || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        if (timeLeft <= 1) {
            setIsTimeUp(true);
            handleSubmit(); // Auto-submit when time is up
        }

        return () => clearInterval(timer);
    }, [timeLeft, loading, submitting, handleSubmit]);

    const handleAnswerSelect = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    const handleNext = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const confirmAndSubmit = async () => {
        // This is a new function to be called from the dialog
        await handleSubmit();
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = useMemo(() => {
        return quiz?.questions[currentQuestionIndex];
    }, [quiz, currentQuestionIndex]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader className="h-12 w-12 animate-spin text-buttonsCustom-600" />
                <p className="ml-4 text-lg font-medium text-gray-700">Loading Quiz...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-red-50">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="ml-4 text-lg font-medium text-red-700">{error}</p>
            </div>
        );
    }

    if (!quiz || !currentQuestion) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <HelpCircle className="h-12 w-12 text-gray-400" />
                <p className="ml-4 text-lg font-medium text-gray-600">Quiz data could not be found.</p>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 font-sans">
            <StudentHeader />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="overflow-hidden shadow-2xl border-white/20 bg-white/80 backdrop-blur-lg">
                        <CardHeader className="bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-buttonsCustom-900">{quiz.title}</CardTitle>
                                    <CardDescription className="text-buttonsCustom-600 mt-1">{quiz.description}</CardDescription>
                                </div>
                                <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'}`}>
                                    <Timer className="h-6 w-6" />
                                    <span className="text-xl tracking-wider">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                                    <p className="text-sm font-medium text-gray-600">{answeredQuestions} / {totalQuestions} Answered</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <motion.div
                                        className="bg-buttonsCustom-600 h-2.5 rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ ease: "easeInOut" }}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion.quiz_question_id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <fieldset>
                                        <legend className="text-xl font-semibold text-gray-800 mb-6">{currentQuestion.question_text}</legend>
                                        <RadioGroup
                                            value={answers[currentQuestion.quiz_question_id] || ''}
                                            onValueChange={(value) => handleAnswerSelect(currentQuestion.quiz_question_id, value)}
                                            className="space-y-4"
                                        >
                                            {currentQuestion.options.map((option) => (
                                                <div key={option.quiz_question_option_id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-buttonsCustom-500 transition-all">
                                                    <RadioGroupItem value={option.quiz_question_option_id} id={option.quiz_question_option_id} />
                                                    <Label htmlFor={option.quiz_question_option_id} className="text-base text-gray-700 font-normal w-full cursor-pointer">
                                                        {option.option_text}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </fieldset>
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-8 flex justify-between items-center border-t border-gray-200 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={handlePrev}
                                    disabled={currentQuestionIndex === 0 || submitting}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </Button>

                                {currentQuestionIndex < totalQuestions - 1 ? (
                                    <Button onClick={handleNext} className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white flex items-center gap-2">
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setIsSubmitConfirmOpen(true)}
                                        disabled={submitting}
                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Quiz"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            {/* Submit Confirmation Dialog */}
            <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />Confirm Submission</DialogTitle>
                        <DialogDescription>
                            You have answered {answeredQuestions} out of {totalQuestions} questions. Are you sure you want to submit your answers?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={confirmAndSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                            Yes, Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Time's Up Dialog */}
            <Dialog open={isTimeUp && !submitting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Timer className="text-red-500" />Time&apos;s Up!</DialogTitle>
                        <DialogDescription>
                            The time for this quiz has expired. Your answers will be submitted automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                         <Button disabled>Submitting...</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default QuizTakePage; 