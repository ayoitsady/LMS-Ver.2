"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, ArrowRight, Star } from "lucide-react";
import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";
import CartId from "@/views/plugins/CartId";
import GetCurrentAddress from "@/views/plugins/UserCountry";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Course {
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
}

interface WishlistItem {
  course: Course;
}

function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { setCartCount } = useCart();
  const [country, setCountry] = useState("");

  const fetchWishlist = async () => {
    try {
      const res = await useAxios.get(`student/wishlist/${UserData()?.user_id}/`);
      setWishlist(res.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  useEffect(() => {
    const getCountry = async () => {
      try {
        const countryName = await GetCurrentAddress();
        setCountry(countryName);
      } catch (error) {
        console.error("Error getting country:", error);
        setCountry("");
      }
    };
    getCountry();
    fetchWishlist();
  }, []);

  const addToCart = async (courseId: number, userId: number, price: number, country: string, cartId: string) => {
    const formdata = new FormData();
    formdata.append("course_id", courseId.toString());
    formdata.append("user_id", userId.toString());
    formdata.append("price", price.toString());
    formdata.append("country_name", country);
    formdata.append("cart_id", cartId);

    try {
      await useAxios.post(`course/cart/`, formdata);
      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });

      const cartRes = await useAxios.get(`course/cart-list/${CartId()}/`);
      setCartCount(cartRes.data?.length);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const addToWishlist = async (courseId: number) => {
    const formdata = new FormData();
    const userId = UserData()?.user_id;
    if (!userId) return;

    formdata.append("user_id", userId.toString());
    formdata.append("course_id", courseId.toString());

    try {
      const res = await useAxios.post(`student/wishlist/${userId}/`, formdata);
      fetchWishlist();
      Toast().fire({
        icon: "success",
        title: res.data.message,
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <StudentHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <StudentSidebar />
          
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-semibold text-gray-900">Wishlist</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card
                  key={item.course.id}
                  className="flex flex-col h-full rounded-2xl shadow-md border border-gray-200 bg-white transition-transform hover:scale-[1.025] hover:shadow-xl group"
                >
                  <Link href={`/course-details/${item.course.slug}`} className="block">
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                      <Image
                        src={item.course.image}
                        alt={item.course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                    </div>
                  </Link>
                  <CardContent className="flex-1 flex flex-col p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border-blue-200">
                        {item.course.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 border-green-200">
                        {item.course.language}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900">
                      <Link href={`/course-details/${item.course.slug}`} className="hover:text-buttonsCustom-600 transition-colors">
                        {item.course.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">By: {item.course.teacher.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span>
                        {item.course.students?.length || 0} Student{item.course.students?.length !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{item.course.average_rating?.toFixed(1) || '0'}</span>
                        <span>({item.course.reviews?.length || 0} Reviews)</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className="text-lg font-bold text-buttonsCustom-600">
                        ₹ {item.course.price}
                      </span>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addToWishlist(item.course.id)}
                          className="text-red-500 hover:text-red-600 rounded-full border border-transparent hover:border-red-200"
                          aria-label="Add to wishlist"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          onClick={() => {
                            const userId = UserData()?.user_id;
                            const cartId = CartId();
                            if (userId && cartId) {
                              addToCart(item.course.id, userId, item.course.price, country, cartId);
                            }
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          <span className="hidden xs:inline">Add to Cart</span>
                        </Button>
                        <Button size="sm" className="rounded-md bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 text-white">
                          <span className="hidden xs:inline">Enroll Now</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {wishlist.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600">Start adding courses to your wishlist!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
