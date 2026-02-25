"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import InstructorSidebar from '@/components/instructor/Sidebar';
import InstructorHeader from '@/components/instructor/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAxios from '@/utils/axios';
import { BarChart3, Trophy, Users, TrendingUp, TrendingDown, ArrowUpDown, ChevronsUpDown } from "lucide-react";
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StudentAttempt {
  user_id: string;
  score: number;
  attempt_number: number;
  completed_at: string;
}

interface AnalyticsData {
  total_attempted: number;
  average_score: number;
  pass_rate: number;
  highest_score: number;
  lowest_score: number;
  attempts_distribution: Record<number, number>;
  top_performers: StudentAttempt[];
  students_best_attempts: StudentAttempt[];
}

export default function QuizAnalyticsPage() {
  const params = useParams();
  const quiz_id = params.quiz_id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  type SortKey = 'user_id' | 'score' | 'attempt_number' | 'completed_at';
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedStudentAttempts = useMemo(() => {
    if (!data?.students_best_attempts) return [];
    
    return [...data.students_best_attempts].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data?.students_best_attempts, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await useAxios.get(`quiz/${quiz_id}/analytics/`);
        setData(res.data);
      } catch {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [quiz_id]);

  const SortableHeader = ({ tkey, title }: { tkey: SortKey, title: string }) => (
    <th className="p-3 text-left font-semibold cursor-pointer" onClick={() => handleSort(tkey)}>
      <div className="flex items-center gap-2">
        {title}
        {sortKey === tkey ? <ArrowUpDown className="w-4 h-4" /> : <ChevronsUpDown className="w-4 h-4 text-gray-400" />}
      </div>
    </th>
  );

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
                <BarChart3 className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Quiz Analytics</h4>
                <p className="text-sm text-gray-500">View performance and statistics for this quiz</p>
              </div>
            </div>
            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">Loading analytics...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : data ? (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-blue-900">{data.total_attempted}</div>
                          <div className="text-sm text-blue-700">Total Students Attempted</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-900">{typeof data.average_score === 'number' ? data.average_score.toFixed(2) : '0.00'}</div>
                          <div className="text-sm text-green-700">Average Score</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                        <Trophy className="w-8 h-8 text-yellow-600" />
                        <div>
                          <div className="text-2xl font-bold text-yellow-900">{data.pass_rate}%</div>
                          <div className="text-sm text-yellow-700">Pass Rate</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold text-purple-900">{data.highest_score}</div>
                          <div className="text-sm text-purple-700">Highest Score</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                        <TrendingDown className="w-8 h-8 text-pink-600" />
                        <div>
                          <div className="text-2xl font-bold text-pink-900">{data.lowest_score}</div>
                          <div className="text-sm text-pink-700">Lowest Score</div>
                        </div>
                      </div>
                    </div>
                    {/* Attempts Distribution Bar Chart */}
                    <div className="mt-8">
                      <h5 className="font-semibold text-lg mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Attempts Distribution</h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {Object.keys(data.attempts_distribution || {}).length === 0 ? (
                          <div className="text-gray-400 text-center py-8">No attempts distribution data available.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(data.attempts_distribution).map(([attempt, count]) => ({ attempt: `Attempt ${attempt}`, count }))}>
                              <XAxis dataKey="attempt" />
                              <YAxis allowDecimals={false} />
                              <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #ddd'}} />
                              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                    {/* Pass/Fail Pie Chart */}
                    <div className="mt-8">
                      <h5 className="font-semibold text-lg mb-2 flex items-center gap-2"><Trophy className="w-5 h-5" /> Pass/Fail Rate</h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center">
                        {typeof data.pass_rate !== 'number' || (data.pass_rate === 0 && (!data.total_attempted || data.total_attempted === 0)) ? (
                          <div className="text-gray-400 text-center py-8">No pass/fail data available.</div>
                        ) : (
                          <ResponsiveContainer width={300} height={250}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Pass', value: data.pass_rate },
                                  { name: 'Fail', value: 100 - data.pass_rate },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(entry) => `${entry.name} ${entry.value}%`}
                              >
                                <Cell key="pass" fill="#22c55e" />
                                <Cell key="fail" fill="#ef4444" />
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                    {/* Top Performers Leaderboard */}
                    <div className="mt-8">
                      <h5 className="font-semibold text-lg mb-2 flex items-center gap-2"><Trophy className="w-5 h-5" /> Top 5 Performers</h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                        {data.top_performers.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">No top performers data available.</div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-buttonsCustom-50 to-buttonsCustom-100 text-buttonsCustom-900 text-sm">
                                <th className="p-3 text-left font-semibold">#</th>
                                <th className="p-3 text-left font-semibold">Student ID</th>
                                <th className="p-3 text-left font-semibold">Score</th>
                                <th className="p-3 text-left font-semibold">Attempt</th>
                                <th className="p-3 text-left font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.top_performers.map((p, idx) => (
                                <tr key={p.user_id} className="text-sm text-gray-800 border-t border-gray-200">
                                  <td className="p-3 font-bold">{idx + 1}</td>
                                  <td className="p-3">{p.user_id}</td>
                                  <td className="p-3">{p.score}</td>
                                  <td className="p-3">{p.attempt_number}</td>
                                  <td className="p-3">{formatDate(p.completed_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                    {/* Full Student Roster */}
                    <div className="mt-8">
                      <h5 className="font-semibold text-lg mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Full Student Roster (Best Attempts)</h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                        {sortedStudentAttempts.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">No student performance data available.</div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-buttonsCustom-50 to-buttonsCustom-100 text-buttonsCustom-900 text-sm">
                                <SortableHeader tkey="user_id" title="Student ID" />
                                <SortableHeader tkey="score" title="Best Score" />
                                <SortableHeader tkey="attempt_number" title="Best Attempt #" />
                                <SortableHeader tkey="completed_at" title="Date" />
                              </tr>
                            </thead>
                            <tbody>
                              {sortedStudentAttempts.map((p) => (
                                <tr key={p.user_id} className="text-sm text-gray-800 border-t border-gray-200">
                                  <td className="p-3">{p.user_id}</td>
                                  <td className="p-3">{p.score}</td>
                                  <td className="p-3">{p.attempt_number}</td>
                                  <td className="p-3">{formatDate(p.completed_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                   </div>
                 ) : (
                   <div className="py-8 text-center text-gray-500">No analytics data found.</div>
                 )}
                 <div className="mt-8">
                   <a href="/instructor/quiz-manage/">
                     <Button variant="outline">Back to Quizzes</Button>
                   </a>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>
       </div>
     </div>
  );
} 