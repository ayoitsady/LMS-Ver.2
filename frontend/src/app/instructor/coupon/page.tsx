"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  PercentIcon,
  Calendar,
  Users,
  X,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  used_by: number;
  date: string;
}

export default function Coupon() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [createCoupon, setCreateCoupon] = useState({ code: "", discount: 0 });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await useAxios.get(`teacher/coupon-list/${UserData()?.teacher_id}/`);
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCouponChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name === "discount" 
      ? Number(event.target.value) 
      : event.target.value;
      
    setCreateCoupon({
      ...createCoupon,
      [event.target.name]: value,
    });
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("teacher", String(UserData()?.teacher_id || ""));
    formdata.append("code", createCoupon.code);
    formdata.append("discount", String(createCoupon.discount));

    try {
      await useAxios.post(`teacher/coupon-list/${UserData()?.teacher_id}/`, formdata);
      fetchCoupons();
      setIsAddDialogOpen(false);
      setCreateCoupon({ code: "", discount: 0 });
      Toast().fire({
        icon: "success",
        title: "Coupon created successfully",
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to create coupon",
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await useAxios.delete(`teacher/coupon-detail/${UserData()?.teacher_id}/${couponId}/`);
      fetchCoupons();
      Toast().fire({
        icon: "success",
        title: "Coupon deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to delete coupon",
      });
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCreateCoupon({ code: coupon.code, discount: coupon.discount });
    setIsEditDialogOpen(true);
  };

  const handleCouponUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoupon) return;

    const code = createCoupon.code || selectedCoupon.code;
    const discount = createCoupon.discount || selectedCoupon.discount;

    const formdata = new FormData();
    formdata.append("teacher", String(UserData()?.teacher_id || ""));
    formdata.append("code", code);
    formdata.append("discount", String(discount));

    try {
      await useAxios.patch(`teacher/coupon-detail/${UserData()?.teacher_id}/${selectedCoupon.id}/`, formdata);
      fetchCoupons();
      setIsEditDialogOpen(false);
      Toast().fire({
        icon: "success",
        title: "Coupon updated successfully",
      });
    } catch (error) {
      console.error("Error updating coupon:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to update coupon",
      });
    }
  };

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
                <Ticket className="h-5 w-5 text-buttonsCustom-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Coupons</h4>
                <p className="text-sm text-gray-500">Manage discount codes for your courses</p>
              </div>
            </motion.div>

            <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
              <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Discount Coupons</CardTitle>
                    <CardDescription className="text-buttonsCustom-500 mt-1">
                      Create and manage discount codes for your courses
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-3 mt-2">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-4 w-36" />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-9" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : coupons.length > 0 ? (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {coupons.map((coupon, index) => (
                        <motion.div
                          key={coupon.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/50 hover:bg-white/80 transition-colors duration-200 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm p-4 sm:p-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">{coupon.code}</h3>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {coupon.discount}% OFF
                                </Badge>
                              </div>
                              
                              <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-3.5 w-3.5 mr-1.5" />
                                  <span>{coupon.used_by} {coupon.used_by === 1 ? 'Student' : 'Students'} used</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                  <span>Created on {format(new Date(coupon.date), "dd MMM, yyyy")}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-3 sm:mt-0">
                              <Button 
                                variant="outline" 
                                onClick={() => handleEditCoupon(coupon)}
                                className="border-buttonsCustom-200 text-buttonsCustom-700 hover:bg-buttonsCustom-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-md">
                    <div className="bg-gray-50/80 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Ticket className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No coupons found</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      Create your first coupon to offer discounts on your courses
                    </p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      variant="outline" 
                      className="mt-4 border-buttonsCustom-200 text-buttonsCustom-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Coupon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-buttonsCustom-600" />
              Create New Coupon
            </DialogTitle>
            <DialogDescription>
              Create a discount coupon for your courses
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCouponSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g. SUMMER25"
                  value={createCoupon.code}
                  onChange={handleCreateCouponChange}
                  className="border-buttonsCustom-200 focus:border-buttonsCustom-400"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Percentage (%)</Label>
                <div className="relative">
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 25"
                    value={createCoupon.discount || ""}
                    onChange={handleCreateCouponChange}
                    className="border-buttonsCustom-200 focus:border-buttonsCustom-400 pl-8"
                    required
                  />
                  <PercentIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">
                <Check className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-buttonsCustom-600" />
              Update Coupon
            </DialogTitle>
            <DialogDescription>
              Update details for coupon <span className="font-medium">{selectedCoupon?.code}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCouponUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Coupon Code</Label>
                <Input
                  id="edit-code"
                  name="code"
                  placeholder="e.g. SUMMER25"
                  value={createCoupon.code}
                  onChange={handleCreateCouponChange}
                  className="border-buttonsCustom-200 focus:border-buttonsCustom-400"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-discount">Discount Percentage (%)</Label>
                <div className="relative">
                  <Input
                    id="edit-discount"
                    name="discount"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 25"
                    value={createCoupon.discount || ""}
                    onChange={handleCreateCouponChange}
                    className="border-buttonsCustom-200 focus:border-buttonsCustom-400 pl-8"
                    required
                  />
                  <PercentIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-200">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 text-white">
                <Check className="h-4 w-4 mr-2" />
                Update Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
