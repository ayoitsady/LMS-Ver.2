"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Plus, PlusCircle, Info, Save, FileVideo, BookOpen, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Cookie from "js-cookie";
import Link from "next/link";
import { motion } from "framer-motion";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import CKEditorWrapper from "@/components/CKEditorWrapper";

import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: number;
  title: string;
}

interface VariantItem {
  title: string;
  description: string;
  file: string | File;
  preview: boolean;
  variant_item_id?: number;
}

interface Variant {
  title: string;
  items: VariantItem[];
  id?: number;
  variant_id?: number;
}

interface Course {
  category: number | { id: number };
  file: string | File;
  image: string;
  title: string;
  description: string;
  price: string;
  level: string;
  language: string;
  teacher_course_status: string;
  curriculum?: Variant[];
}

export default function CourseEdit() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;

  const [course, setCourse] = useState<Course>({
    category: 0,
    file: "",
    image: "",
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    teacher_course_status: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
        {
            title: "",
            items: [{ title: "", description: "", file: "", preview: false }],
        },
    ]);
  const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
    const courseImageUrl = Cookie.get("course_image_url");
    if (courseImageUrl) {
      setCourse((prev) => ({
        ...prev,
        image: courseImageUrl,
      }));
      setImagePreview(courseImageUrl);
        }
    }, []);

  useEffect(() => {
    console.log("Image preview URL:", imagePreview);
    console.log("Course image value:", course.image);
  }, [imagePreview, course.image]);

  const fetchCourseDetail = useCallback(async () => {
    try {
      const [categoriesRes, courseRes] = await Promise.all([
        useAxios.get(`course/category/`),
        useAxios.get(`teacher/course-detail/${courseId}/`),
      ]);

      setCategories(categoriesRes.data);
      
      const courseData = courseRes.data;
      setCourse(courseData);
      setEditorContent(courseData.description);
      
      if (courseData.curriculum && Array.isArray(courseData.curriculum)) {
        setVariants(courseData.curriculum);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details");
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const handleCourseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setCourse((prev) => ({
      ...prev,
      [name]: (e.target as HTMLInputElement).type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (data: string) => {
    setEditorContent(data);
  };

  const handleCourseImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
        const file = event.target.files[0];
    setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await useAxios.post("/file-upload/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response?.data?.url) {
        Cookie.set("course_image_url", response.data.url);
        setImagePreview(response.data.url);
        setCourse((prev) => ({
          ...prev,
          image: response.data.url,
        }));
        toast.success("Image uploaded successfully");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

  const handleCourseIntroVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setCourse((prev) => ({
      ...prev,
      file: event.target.files![0],
    }));
  };

  const handleVariantChange = (index: number, name: string, value: string) => {
        const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [name]: value,
    };
    setVariants(updatedVariants);
  };

  const handleItemChange = (
    variantIndex: number, 
    itemIndex: number, 
    name: string, 
    value: string | boolean | File
  ) => {
        const updatedVariants = [...variants];
    updatedVariants[variantIndex].items[itemIndex] = {
      ...updatedVariants[variantIndex].items[itemIndex],
      [name]: value,
    };
        setVariants(updatedVariants);
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            {
                title: "",
                items: [{ title: "", description: "", file: "", preview: false }],
            },
        ]);
    };

  const removeVariant = async (index: number, variantId?: number) => {
    if (variantId) {
      try {
        await useAxios.delete(
          `teacher/course/variant-delete/${variantId}/${UserData()?.teacher_id}/${courseId}/`
        );
        toast.success("Section deleted successfully");
        fetchCourseDetail();
      } catch (error) {
        console.error("Error deleting variant:", error);
        toast.error("Failed to delete section");
      }
    } else {
        const updatedVariants = [...variants];
        updatedVariants.splice(index, 1);
        setVariants(updatedVariants);
    }
  };

  const addItem = (variantIndex: number) => {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].items.push({
            title: "",
            description: "",
            file: "",
            preview: false,
        });
        setVariants(updatedVariants);
    };

  const removeItem = async (
    variantIndex: number, 
    itemIndex: number, 
    variantId?: number, 
    itemId?: number
  ) => {
    if (variantId && itemId) {
      try {
        await useAxios.delete(
          `teacher/course/variant-item-delete/${variantId}/${itemId}/${UserData()?.teacher_id}/${courseId}/`
        );
        toast.success("Lesson deleted successfully");
        fetchCourseDetail();
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete lesson");
      }
    } else {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].items.splice(itemIndex, 1);
        setVariants(updatedVariants);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      
      formData.append("title", course.title);
      formData.append("description", editorContent);
      
      const categoryId = typeof course.category === 'object' 
        ? course.category.id 
        : course.category;
      formData.append("category", categoryId.toString());
      
      formData.append("price", course.price);
      formData.append("level", course.level);
      formData.append("language", course.language);
      
      const teacherId = UserData()?.teacher_id;
      if (teacherId !== undefined) {
        formData.append("teacher", teacherId.toString());
        
        if (course.file && typeof course.file !== "string") {
          formData.append("file", course.file);
        }
        
        if (variants && Array.isArray(variants) && variants.length > 0) {
        variants.forEach((variant, variantIndex) => {
            if (!variant.title.trim()) return;
            
            Object.entries(variant).forEach(([key, value]) => {
              if (key !== 'items') {
                formData.append(`variants[${variantIndex}][variant_${key}]`, String(value));
              }
            });

            variant.items.forEach((item, itemIndex) => {
              if (!item.title.trim()) return;
              
                Object.entries(item).forEach(([itemKey, itemValue]) => {
                if (itemKey === 'file' && typeof itemValue === 'object' && itemValue instanceof File) {
                  formData.append(`variants[${variantIndex}][items][${itemIndex}][${itemKey}]`, itemValue);
                } else {
                  formData.append(
                    `variants[${variantIndex}][items][${itemIndex}][${itemKey}]`, 
                    String(itemValue)
                  );
                }
                });
            });
        });
        }

        console.log("Form data being sent:");
        Array.from(formData.entries()).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });

        await useAxios.patch(
          `teacher/course-update/${teacherId}/${courseId}/`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
          }
        );
        
        toast.success("Course updated successfully");
        router.push("/instructor/courses");
      } else {
        toast.error("Teacher ID not found");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        console.error("Error details:", err.response.data);
        
        if (typeof err.response.data === 'object') {
          try {
            const errorMessage = Object.entries(err.response.data as Record<string, unknown>)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            toast.error(`Error: ${errorMessage}`);
          } catch (parseError) {
            console.error("Error parsing validation errors:", parseError);
            toast.error("Failed to update course: Invalid response");
          }
        } else {
          toast.error(`Error: ${String(err.response.data)}`);
        }
      } else {
        toast.error("Failed to update course");
      }
    } finally {
      setIsSaving(false);
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
            <motion.div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-buttonsCustom-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-buttonsCustom-600" />
                                                    </div>
                                                    <div>
                <h4 className="text-xl font-bold text-gray-900">Edit Course</h4>
                <p className="text-sm text-gray-500">Update your course details and curriculum</p>
              </div>
            </motion.div>
            
            <form onSubmit={handleSubmit}>
              {/* Card for course details */}
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl mb-6">
                {/* Gradient Header */}
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Course Details</CardTitle>
                      <p className="text-sm text-buttonsCustom-500 mt-1">
                        Update your course information and curriculum
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="border-buttonsCustom-200 text-buttonsCustom-600 hover:bg-buttonsCustom-50 gap-2"
                    >
                      <Link href="/instructor/courses/">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Courses
                                                        </Link>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Thumbnail */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Course Thumbnail
                    </label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-white/50 shadow-sm border-buttonsCustom-200/30 group">
                      {course.image ? (
                        <Image
                          src={course.image.startsWith('http') ? course.image : `/media/${imagePreview}`}
                          alt="Course thumbnail"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.01]"
                          onError={(e) => {
                            console.error("Image failed to load:", course.image);
                            e.currentTarget.src = "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50">
                          <div className="text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-buttonsCustom-200" />
                            <p className="mt-2 text-sm text-buttonsCustom-400">Thumbnail Preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Upload Thumbnail
                        </label>
                        <div className="mt-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleCourseImageChange}
                            disabled={loading}
                            className="cursor-pointer file:cursor-pointer file:text-buttonsCustom-600 file:bg-buttonsCustom-50 file:border-buttonsCustom-200 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border file:transition-colors file:hover:bg-buttonsCustom-100"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Use a 16:9 ratio image for best results
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Intro Video
                        </label>
                        <div className="mt-1">
                          <Input
                            type="file"
                            accept="video/*"
                            name="file"
                            onChange={handleCourseIntroVideoChange}
                            className="cursor-pointer file:cursor-pointer file:text-buttonsCustom-600 file:bg-buttonsCustom-50 file:border-buttonsCustom-200 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border file:transition-colors file:hover:bg-buttonsCustom-100"
                          />
                          {typeof course.file === 'string' && course.file && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-buttonsCustom-600">
                              <div className="flex items-center space-x-2">
                                <FileVideo className="h-4 w-4" />
                                <a
                                  href={course.file.startsWith('http') ? course.file : `/media/${course.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-buttonsCustom-600 hover:underline"
                                >
                                  View uploaded intro video
                                                        </a>
                                                    </div>
                                                </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload a short introduction video for your course
                          </p>
                                            </div>
                                        </div>
                                    </div>
                                        </div>
                  
                  <Separator className="bg-buttonsCustom-100" />
                  
                  {/* Title */}
                  <div>
                    <label htmlFor="courseTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Course Title
                                            </label>
                    <Input
                      id="courseTitle"
                      name="title"
                      value={course.title}
                      onChange={handleCourseInputChange}
                      placeholder="Enter course title"
                      className="mt-1 border-buttonsCustom-200 focus:border-buttonsCustom-600 focus:ring-buttonsCustom-600/10"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Write a clear, descriptive title for your course (60 characters max)
                    </p>
                  </div>
                  
                  {/* Category, Level, Language */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Category
                                                </label>
                      <Select
                        value={
                          typeof course.category === 'object' 
                            ? course.category.id.toString() 
                            : course.category.toString()
                        }
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger className="mt-1 border-buttonsCustom-200 focus:ring-buttonsCustom-600/10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="border-buttonsCustom-100">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose a category that best fits your course
                      </p>
                                            </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Level
                                                </label>
                      <Select
                        value={course.level}
                        onValueChange={(value) => handleSelectChange("level", value)}
                      >
                        <SelectTrigger className="mt-1 border-buttonsCustom-200 focus:ring-buttonsCustom-600/10">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="border-buttonsCustom-100">
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intemediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set the difficulty level of your course
                      </p>
                                            </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Language
                                                </label>
                      <Select
                        value={course.language}
                        onValueChange={(value) => handleSelectChange("language", value)}
                      >
                        <SelectTrigger className="mt-1 border-buttonsCustom-200 focus:ring-buttonsCustom-600/10">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="border-buttonsCustom-100">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose the language your course is taught in
                      </p>
                    </div>
                                            </div>
                  
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Course Description
                    </label>
                    <div className="mt-1 border rounded-md overflow-hidden border-buttonsCustom-200 hover:border-buttonsCustom-500 focus-within:border-buttonsCustom-600 focus-within:ring-2 focus-within:ring-buttonsCustom-600/20 transition-all duration-200">
                      <CKEditorWrapper
                        initialData={editorContent}
                        onChange={handleEditorChange}
                      />
                                            </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide a detailed description of what students will learn
                    </p>
                                            </div>

                  {/* Price */}
                  <div className="max-w-xs">
                    <label htmlFor="coursePrice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Price (₹)
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-buttonsCustom-400">₹</span>
                      <Input
                        id="coursePrice"
                        type="number"
                        name="price"
                        value={course.price}
                        onChange={handleCourseInputChange}
                        placeholder="e.g. 1999"
                        className="pl-8 border-buttonsCustom-200 focus:border-buttonsCustom-600 focus:ring-buttonsCustom-600/10"
                      />
                                            </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set a competitive price for your course
                    </p>
                                            </div>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card className="border-buttonsCustom-200 overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl mb-6">
                <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-buttonsCustom-50/50 to-transparent border-b border-buttonsCustom-100">
                  <CardTitle className="text-lg sm:text-xl text-buttonsCustom-900">Curriculum</CardTitle>
                  <p className="text-sm text-buttonsCustom-500 mt-1">
                    Organize your course content into sections and lessons
                  </p>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="space-y-4">
                    {variants.map((variant, variantIndex) => (
                      <div 
                        key={variantIndex}
                        className="border rounded-lg overflow-hidden bg-gray-50 border-buttonsCustom-200/50"
                      >
                        <div className="p-4 bg-buttonsCustom-50 flex items-center justify-between gap-4 border-b border-buttonsCustom-100">
                          <Input
                            placeholder="Section Title"
                            value={variant.title}
                            onChange={(e) => handleVariantChange(
                              variantIndex, 
                              "title", 
                              e.target.value
                            )}
                            className="flex-1 border-buttonsCustom-200 focus:border-buttonsCustom-600 focus:ring-buttonsCustom-600/10"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(variantIndex, variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                                        </div>

                        <div className="p-4 space-y-3">
                          {variant.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className="border rounded-lg p-4 bg-white shadow-sm border-buttonsCustom-200/50 hover:border-buttonsCustom-300/70 transition-colors"
                            >
                              <div className="space-y-4">
                                <Input
                                  placeholder="Lesson Title"
                                  value={item.title}
                                  onChange={(e) => handleItemChange(
                                    variantIndex,
                                    itemIndex,
                                    "title",
                                    e.target.value
                                  )}
                                  className="w-full border-buttonsCustom-200 focus:border-buttonsCustom-600 focus:ring-buttonsCustom-600/10"
                                />
                                
                                <Textarea
                                  placeholder="Lesson Description"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(
                                    variantIndex,
                                    itemIndex,
                                    "description",
                                    e.target.value
                                  )}
                                  rows={3}
                                  className="w-full border-buttonsCustom-200 focus:border-buttonsCustom-600 focus:ring-buttonsCustom-600/10"
                                />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                  <div>
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleItemChange(
                                            variantIndex,
                                            itemIndex,
                                            "file",
                                            e.target.files[0]
                                          );
                                        }
                                      }}
                                      className="cursor-pointer file:cursor-pointer file:text-buttonsCustom-600 file:bg-buttonsCustom-50 file:border-buttonsCustom-200 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border file:transition-colors file:hover:bg-buttonsCustom-100"
                                    />
                                    {typeof item.file === 'string' && item.file && (
                                      <div className="mt-2 flex items-center gap-2 text-xs text-buttonsCustom-600">
                                        <FileVideo className="h-3 w-3" />
                                        <a
                                          href={item.file.startsWith('http') ? item.file : `/media/${item.file}`}
                                          target="_blank"
                                          rel="noopener noreferrer" 
                                          className="hover:underline"
                                        >
                                          View uploaded file
                                        </a>
                                      </div>
                                    )}
                                        </div>
                                  
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`preview-${variantIndex}-${itemIndex}`}
                                        checked={item.preview}
                                        onCheckedChange={(checked) => handleItemChange(
                                          variantIndex,
                                          itemIndex,
                                          "preview",
                                          !!checked
                                        )}
                                      />
                                      <label
                                        htmlFor={`preview-${variantIndex}-${itemIndex}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        Preview Lesson
                                      </label>
                                                    </div>
                                    
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeItem(
                                        variantIndex, 
                                        itemIndex, 
                                        variant.variant_id, 
                                        item.variant_item_id
                                      )}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(variantIndex)}
                            className="w-full mt-2 border-buttonsCustom-200 text-buttonsCustom-700 hover:bg-buttonsCustom-50 hover:text-buttonsCustom-800"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                                                </div>
                                            ))}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addVariant}
                      className="w-full bg-buttonsCustom-100 hover:bg-buttonsCustom-200 text-buttonsCustom-800"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Section
                    </Button>
                                        </div>
                </CardContent>
                
                <CardFooter className="border-t p-4 sm:p-6 bg-buttonsCustom-50 flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Info className="h-4 w-4 mr-2 text-buttonsCustom-500" />
                    Organize your course into logical sections and lessons
                                    </div>
                </CardFooter>
              </Card>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg"
                className="w-full sm:w-auto float-right gap-2 bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-800 hover:from-buttonsCustom-700 hover:to-buttonsCustom-900 shadow-md hover:shadow-lg transition-all duration-200 text-white py-6"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Updating Course...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Update Course
                  </>
                )}
              </Button>
                        </form>
                    </div>
                </div>
      </div>
    </div>
  );
}
