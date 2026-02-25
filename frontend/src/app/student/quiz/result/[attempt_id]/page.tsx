"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, BookOpen, Check, X, HelpCircle, ChevronLeft, Loader, AlertTriangle } from 'lucide-react';

import apiInstance from '@/utils/axios';
import Toast from '@/views/plugins/Toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StudentHeader from '@/components/student/Header';

interface QuizAttemptResult {
    attempt_id: string;
    quiz_id: string;
    quiz_title: string;
    score: number;
    total_possible: number;
    percentage: number;
    passed: boolean;
    min_pass_points: number;
    attempt_number: number;
    completed_at: string;
    answers_breakdown: {
        question_id: string;
        question_text: string;
        selected_option_id: string;
        selected_option_text: string;
        is_correct: boolean;
        points_earned: number;
        points_possible: number;
    }[];
    summary: {
        total_questions: number;
        correct_answers: number;
        incorrect_answers: number;
        unanswered: number;
    };
}

const QuizResultPage = () => {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.attempt_id as string;

    const [result, setResult] = useState<QuizAttemptResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResult = useCallback(async () => {
        if (!attemptId) return;
        
        setLoading(true);
        try {
            console.log('Fetching result for attempt ID:', attemptId);
            const response = await apiInstance.get<QuizAttemptResult>(`quiz/attempt/${attemptId}/result/`);
            console.log('Result response:', response.data);
            setResult(response.data);
        } catch (err) {
            console.error('Error fetching result:', err);
            setError('Failed to load quiz results. Please try again later.');
            Toast().fire({ icon: 'error', title: 'Could not load results.' });
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader className="h-12 w-12 animate-spin text-buttonsCustom-600" />
                <p className="ml-4 text-lg font-medium text-gray-700">Loading Results...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-red-50">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="ml-4 text-lg font-medium text-red-700">{error || 'Results not found.'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 font-sans">
            <StudentHeader />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <Card className={`overflow-hidden shadow-2xl border-2 ${result.passed ? 'border-green-300' : 'border-red-300'} bg-white/80 backdrop-blur-lg`}>
                        <CardHeader className={`p-6 text-white ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}>
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="flex flex-col items-center text-center">
                                <Award className="h-16 w-16 mb-2" />
                                <CardTitle className="text-3xl font-bold">{result.passed ? "Congratulations! You Passed!" : "Don't Give Up! Try Again."}</CardTitle>
                                <CardDescription className="text-white/80 mt-1">Quiz Result for: {result.quiz_title}</CardDescription>
                            </motion.div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6 items-center">
                                <div className="space-y-4 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-gray-800">Your Performance</h3>
                                    <p className="text-5xl font-bold text-gray-900">{result.score}<span className="text-2xl text-gray-500">/{result.total_possible}</span></p>
                                    <p className="text-lg font-medium text-blue-600">{result.percentage}%</p>
                                    <p className="text-lg font-medium">
                                        You needed <span className="font-bold text-blue-600">{result.min_pass_points}</span> points to pass.
                                    </p>
                                    <div className="flex justify-center md:justify-start gap-4">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Check className="h-5 w-5" />
                                            <span className="font-semibold">{result.summary.correct_answers} Correct</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-red-600">
                                            <X className="h-5 w-5" />
                                            <span className="font-semibold">{result.summary.incorrect_answers} Incorrect</span>
                                        </div>
                                        {result.summary.unanswered > 0 && (
                                            <div className="flex items-center gap-2 text-yellow-600">
                                                <HelpCircle className="h-5 w-5" />
                                                <span className="font-semibold">{result.summary.unanswered} Unanswered</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-white/20 bg-white/80 backdrop-blur-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen /> Review Your Answers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {result.answers_breakdown.map((answer, index) => (
                                <div key={answer.question_id} className="border-t pt-6">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-lg text-gray-800">{index + 1}. {answer.question_text}</p>
                                        {answer.is_correct ?
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><Check size={14}/> Correct</span> :
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full"><X size={14}/> Incorrect</span>
                                        }
                                    </div>
                                    <div className="mt-4 p-3 rounded-lg border-2 bg-gray-50">
                                        <p className="text-sm text-gray-700 mb-2">Your answer: <span className="font-medium">{answer.selected_option_text}</span></p>
                                        <p className="text-sm text-gray-600">Points earned: {answer.points_earned}/{answer.points_possible}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <Button onClick={() => router.push('/student/courses')} className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white font-bold text-lg">
                            <ChevronLeft className="mr-2"/> Back to My Courses
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default QuizResultPage; 