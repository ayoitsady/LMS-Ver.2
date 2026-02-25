"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  ShoppingBag, 
  Receipt, 
  IndianRupee, 
  Calendar,
  FileText,
  ArrowUpRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";    
import UserData from "@/views/plugins/UserData";

interface CourseOrder {
  course: {
    title: string;
    id: string;
  };
  price: number;
  order: {
    oid: string;
  };
  date: string;
}

// Platform fee constant
const PLATFORM_FEE_PERCENT = 20;
const getNetEarning = (amount: number) => amount * (1 - PLATFORM_FEE_PERCENT / 100);

export default function Orders() {
  const [orders, setOrders] = useState<CourseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await useAxios.get(`teacher/course-order-list/${UserData()?.teacher_id}/`);
        setOrders(response.data);
        
        // Calculate total revenue (gross and net)
        const total = response.data.reduce((sum: number, order: CourseOrder) => {
          const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0;
          return sum + price;
        }, 0);
        setTotalRevenue(total);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Get current month's orders
  const currentMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    const currentDate = new Date();
    return orderDate.getMonth() === currentDate.getMonth() && 
           orderDate.getFullYear() === currentDate.getFullYear();
  });

  // Calculate current month's revenue (gross and net)
  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => {
    const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0;
    return sum + price;
  }, 0);

  // Net revenue calculations
  const totalNetRevenue = orders.reduce((sum, order) => {
    const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0;
    return sum + getNetEarning(price);
  }, 0);

  const currentMonthNetRevenue = currentMonthOrders.reduce((sum, order) => {
    const price = typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0;
    return sum + getNetEarning(price);
  }, 0);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
                <ShoppingBag className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Orders</h4>
                <p className="text-sm text-gray-500">Manage your course sales and transactions</p>
              </div>
            </motion.div>
            
            {/* Revenue Summary Cards */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-green-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <>₹{!isNaN(Number(totalRevenue)) ? Number(totalRevenue).toFixed(2) : "0.00"}</>
                        )}
                      </h3>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>All time earnings</span>
                      </p>
                      {/* Net Earning */}
                      {!isLoading && (
                        <p className="text-xs text-green-700 mt-1">
                          Net after 20% fee: <span className="font-semibold">₹{totalNetRevenue.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="p-2 bg-green-200/50 rounded-lg">
                      <IndianRupee className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-buttonsCustom-50 to-buttonsCustom-100 border-buttonsCustom-200 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-buttonsCustom-700 mb-1">Monthly Revenue</p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-buttonsCustom-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-24" />
                        ) : (
                          <>₹{!isNaN(Number(currentMonthRevenue)) ? Number(currentMonthRevenue).toFixed(2) : "0.00"}</>
                        )}
                      </h3>
                      <p className="text-xs text-buttonsCustom-600 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Current month</span>
                      </p>
                      {/* Net Earning */}
                      {!isLoading && (
                        <p className="text-xs text-buttonsCustom-700 mt-1">
                          Net after 20% fee: <span className="font-semibold">₹{currentMonthNetRevenue.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="p-2 bg-buttonsCustom-200/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-buttonsCustom-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Orders Table */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
                {/* Gradient Header */}
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Course Orders</CardTitle>
                      <CardDescription className="text-buttonsCustom-500 mt-1">
                        Overview of all course purchases and transactions
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="border-buttonsCustom-200 text-buttonsCustom-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <div className="flex gap-4">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-28" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div>
                      {/* Desktop and Tablet View */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/70">
                              <TableHead className="font-medium text-buttonsCustom-900">Course</TableHead>
                              <TableHead className="font-medium text-buttonsCustom-900">Amount</TableHead>
                              <TableHead className="font-medium text-buttonsCustom-900">Invoice</TableHead>
                              <TableHead className="font-medium text-buttonsCustom-900">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {orders.map((order, index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-gray-50/70 group"
                                >
                                  <TableCell className="font-medium text-gray-900">
                                    <div className="group-hover:translate-x-1 transition-transform duration-200">
                                      {order.course.title}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center text-green-700 font-medium">
                                        <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                        {order.price}
                                      </div>
                                      <div className="text-xs text-green-700">
                                        Net: ₹{getNetEarning(typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0).toFixed(2)}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 group-hover:bg-blue-100 transition-colors duration-200">
                                      <Receipt className="h-3 w-3" />
                                      {order.order.oid}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center text-gray-600 text-sm">
                                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                      {format(new Date(order.date), "dd MMM, yyyy")}
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Mobile View */}
                      <div className="sm:hidden divide-y divide-gray-100">
                        <AnimatePresence>
                          {orders.map((order, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 hover:bg-gray-50/70"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <h4 className="font-medium text-gray-900">{order.course.title}</h4>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 ml-2 flex-shrink-0">
                                  <Receipt className="h-3 w-3" />
                                  {order.order.oid}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center text-green-700 font-medium">
                                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    {order.price}
                                  </div>
                                  <div className="text-xs text-green-700">
                                    Net: ₹{getNetEarning(typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0).toFixed(2)}
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                  {format(new Date(order.date), "dd MMM, yyyy")}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md mx-4 my-6">
                      <div className="bg-gray-50/80 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                        When students purchase your courses, their orders will appear here
                      </p>
                      <Button variant="outline" className="mt-4 border-buttonsCustom-200 text-buttonsCustom-700">
                        View Your Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
    );
}
