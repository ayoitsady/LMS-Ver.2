"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Search as SearchIcon, ShoppingCart, ArrowRight } from "lucide-react";
import apiInstance from "@/utils/axios";
import CartId from "@/views/plugins/CartId";
import GetCurrentAddress from "@/views/plugins/UserCountry";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";
import { useSearchParams } from "next/navigation";

interface Course {
  id: number;
  title: string;
  image: string;
  slug: string;
  description: string;
  price: number;
  language: string;
  level: string;
  teacher: {
    full_name: string;
  };
  students: {
    id: number;
  }[];
  average_rating: number;
  reviews: {
    id: number;
  }[];
}

function SearchContent() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [country, setCountry] = useState("");
  const userId = UserData()?.user_id || "";
  const cartId = CartId() || "";
  const searchParams = useSearchParams();

  useEffect(() => {
    const initCountry = async () => {
      const countryName = await GetCurrentAddress();
      setCountry(countryName);
    };
    initCountry();
  }, []);

  const filterCourses = useCallback((query: string) => {
    if (query === "") {
      setFilteredCourses(allCourses);
    } else {
      const filtered = allCourses.filter((course) =>
        course.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [allCourses]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      filterCourses(query);
    }
  }, [searchParams, filterCourses]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiInstance.get<Course[]>(`/course/course-list/`);
      setAllCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterCourses(query);
  };

  const addToCart = async (courseId: number, userId: string | number, price: number, country: string, cartId: string) => {
    const formdata = new FormData();
    formdata.append("course_id", courseId.toString());
    formdata.append("user_id", userId.toString());
    formdata.append("price", price.toString());
    formdata.append("country_name", country);
    formdata.append("cart_id", cartId);

    try {
      await apiInstance.post(`course/cart/`, formdata);
      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });

      await apiInstance.get(`course/cart-list/${CartId()}/`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-500">
      <div className="container mx-auto px-4 py-12">
        {/* Search Header */}
        <div className="mb-12 text-center">
          <div className="bg-primaryCustom-100/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-primaryCustom-200">
            <h1 className="text-4xl font-bold text-buttonsCustom-800 mb-6">
              Discover Your Next Course
            </h1>
            <p className="text-buttonsCustom-700 text-lg mb-8 max-w-2xl mx-auto">
              Explore our collection of courses and find the perfect match for your learning journey
            </p>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-6 w-6 text-buttonsCustom-600" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-primaryCustom-200 rounded-xl bg-primaryCustom-50/80 backdrop-blur-sm text-buttonsCustom-800 placeholder-buttonsCustom-500 focus:outline-none focus:ring-2 focus:ring-buttonsCustom-500 focus:border-transparent transition-all duration-200"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-buttonsCustom-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="group bg-primaryCustom-50/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-primaryCustom-200"
              >
                <Link href={`/course-details/${course.slug}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primaryCustom-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-primaryCustom-200 text-buttonsCustom-700 rounded-full">
                      {course.level}
                    </span>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-primaryCustom-300 text-buttonsCustom-700 rounded-full">
                      {course.language}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-buttonsCustom-800 mb-3 line-clamp-2 group-hover:text-buttonsCustom-600 transition-colors duration-200">
                    <Link href={`/course-details/${course.slug}`}>
                      {course.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-buttonsCustom-700 mb-4 flex items-center">
                    <span className="font-medium text-buttonsCustom-800">By:</span>
                    <span className="ml-2">{course.teacher.full_name}</span>
                  </p>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(course.average_rating)
                              ? "text-buttonsCustom-500 fill-current"
                              : "text-primaryCustom-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-buttonsCustom-600">
                      ({course.reviews.length} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-primaryCustom-200">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-buttonsCustom-800">
                        ₹{course.price}
                      </span>
                      <span className="text-sm text-buttonsCustom-600">
                        {course.students.length} students enrolled
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (typeof course.price === 'number' && typeof course.id === 'number') {
                            addToCart(course.id, userId, course.price, country, cartId);
                          }
                        }}
                        className="p-2.5 text-buttonsCustom-600 hover:text-buttonsCustom-700 hover:bg-primaryCustom-100 rounded-full transition-colors duration-200"
                      >
                        <ShoppingCart className="w-6 h-6" />
                      </button>
                      <Link
                        href={`/course-details/${course.slug}`}
                        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-buttonsCustom-600 rounded-lg hover:bg-buttonsCustom-700 transition-colors duration-200"
                      >
                        Enroll Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Become Instructor Section */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-primaryCustom-400 to-primaryCustom-500 rounded-3xl overflow-hidden shadow-2xl border border-primaryCustom-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative p-10 lg:p-16">
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-buttonsCustom-800 mb-6">
                    Become an instructor today
                  </h2>
                  <p className="text-buttonsCustom-700 text-lg mb-8 leading-relaxed">
                    Join our community of expert instructors and share your knowledge with millions of students worldwide. We provide the tools and support you need to create engaging courses.
                  </p>
                  <Link
                    href="/become-instructor"
                    className="inline-flex items-center px-8 py-4 bg-buttonsCustom-600 text-white rounded-xl font-semibold hover:bg-buttonsCustom-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Start Teaching Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>

              </div>
              <div className="hidden lg:block relative h-[400px]">
                <Image
                  src="/instructor.png"
                  alt="Become an instructor"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-buttonsCustom-500 border-t-transparent" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
