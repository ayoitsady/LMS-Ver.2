"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Award, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Download, 
  Share2, 
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Toast from "@/views/plugins/Toast";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";


interface Certificate {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    level: string;
    image: string | null;
    course_id: string;
  };
  user: number;
  certificate_id: string;
  student_name: string;
  completion_date: string;
  issue_date: string;
  verification_url: string | null;
  status: 'active' | 'revoked' | 'expired';
  pdf_file: string | null;
  metadata: Record<string, string | number | boolean | null>;
}

// Filters and sort options
type SortOption = 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'revoked' | 'expired';
type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

export default function StudentCertificatesDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const router = useRouter();

  // Wrap the search params usage in a separate component
  function SearchParamsHandler() {
    const searchParams = useSearchParams();
    
    useEffect(() => {
      // Get initial filter values from URL if present
      const tabParam = searchParams.get('tab');
      if (tabParam) setActiveTab(tabParam);
      
      const statusParam = searchParams.get('status') as StatusFilter;
      if (statusParam) setStatusFilter(statusParam);
      
      const levelParam = searchParams.get('level') as LevelFilter;
      if (levelParam) setLevelFilter(levelParam);
      
      const sortParam = searchParams.get('sort') as SortOption;
      if (sortParam) setSortBy(sortParam);
      
      const searchParam = searchParams.get('search');
      if (searchParam) setSearchQuery(searchParam);
    }, [searchParams]);

    return null;
  }
  
  const certificatesPerPage = 9;

  // Apply all filters and sorting
  const applyFilters = useCallback(() => {
    let result = [...certificates];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(cert => cert.status === statusFilter);
    }
    
    // Apply level filter
    if (levelFilter !== 'all') {
      result = result.filter(cert => cert.course.level === levelFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cert => 
        cert.course.title.toLowerCase().includes(query) ||
        cert.certificate_id.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.issue_date).getTime();
      const dateB = new Date(b.issue_date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredCertificates(result);
    setPage(1); // Reset to first page when filters change
    setHasMore(result.length > certificatesPerPage);
  }, [certificates, statusFilter, levelFilter, searchQuery, sortBy, certificatesPerPage]);

  useEffect(() => {
    applyFilters();
  }, [certificates, statusFilter, levelFilter, searchQuery, sortBy, applyFilters]);

  const loadCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = UserData()?.user_id;
      if (!userId) throw new Error("User not authenticated");
      
      const response = await useAxios.get(`/student/certificate/list/${userId}/`);
      setCertificates(response.data || []);
    } catch (error) {
      console.error("Error loading certificates:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to load certificate. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // Update URL with current filters
  const updateUrlWithFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('tab', activeTab);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/student/certificates', { scroll: false });
  }, [activeTab, statusFilter, levelFilter, sortBy, searchQuery, router]);

  useEffect(() => {
    updateUrlWithFilters();
  }, [activeTab, statusFilter, levelFilter, sortBy, searchQuery, updateUrlWithFilters]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'active') setStatusFilter('active');
    else if (value === 'revoked') setStatusFilter('revoked');
    else if (value === 'expired') setStatusFilter('expired');
    else setStatusFilter('all');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    const url = `${window.location.origin}/verify-certificate/${certificate.certificate_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.course.title}`,
          text: `Check out my certificate for completing ${certificate.course.title}!`,
          url,
        });
      } catch (error) {
        console.error("Error sharing certificate:", error);
      }
    } else {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(url);
      Toast().fire({
        icon: "success",
        title: "Certificate link copied to clipboard!",
      });
    }
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
    setHasMore(filteredCertificates.length > page * certificatesPerPage);
  };

  const displayedCertificates = filteredCertificates.slice(0, page * certificatesPerPage);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-96 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          <StudentHeader />
          
          {/* Add SearchParamsHandler inside Suspense */}
          <SearchParamsHandler />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
            <div className="lg:sticky lg:top-4 lg:self-start">
              <StudentSidebar />
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
                  <Award className="h-5 w-5 text-buttonsCustom-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">My Certificates</h4>
                  <p className="text-sm text-gray-500">View and manage your earned certificates</p>
                </div>
              </motion.div>
              
              {/* Filters and Search */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
              >
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-buttonsCustom-400" />
                  <Input
                    type="search"
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 border-buttonsCustom-200 focus:border-buttonsCustom-500"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-buttonsCustom-200 text-buttonsCustom-600">
                        <Filter className="h-4 w-4 mr-2" />
                        Level: {levelFilter === 'all' ? 'All' : levelFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Filter by Level</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLevelFilter('all')} className={levelFilter === 'all' ? 'bg-buttonsCustom-50' : ''}>
                        All Levels
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLevelFilter('Beginner')} className={levelFilter === 'Beginner' ? 'bg-buttonsCustom-50' : ''}>
                        Beginner
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLevelFilter('Intermediate')} className={levelFilter === 'Intermediate' ? 'bg-buttonsCustom-50' : ''}>
                        Intermediate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLevelFilter('Advanced')} className={levelFilter === 'Advanced' ? 'bg-buttonsCustom-50' : ''}>
                        Advanced
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-buttonsCustom-200 text-buttonsCustom-600">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Sort by Date</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortBy('newest')} className={sortBy === 'newest' ? 'bg-buttonsCustom-50' : ''}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('oldest')} className={sortBy === 'oldest' ? 'bg-buttonsCustom-50' : ''}>
                        Oldest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
              
              {/* Tabs */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="all" className="data-[state=active]:bg-buttonsCustom-100 data-[state=active]:text-buttonsCustom-700">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="revoked" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                      Revoked
                    </TabsTrigger>
                    <TabsTrigger value="expired" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700">
                      Expired
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                      // Loading Skeleton
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="relative">
                            <Skeleton className="w-full h-48 rounded-lg" />
                            <div className="mt-3 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <div className="mt-4 flex justify-between">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredCertificates.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {displayedCertificates.map((certificate, index) => (
                            <motion.div
                              key={certificate.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="overflow-hidden border-gray-200 h-full flex flex-col bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <div className="relative h-40 w-full">
                                  {certificate.course?.image ? (
                                    <Image
                                      src={certificate.course.image}
                                      alt={certificate.course.title}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-buttonsCustom-100 to-buttonsCustom-200 flex items-center justify-center">
                                      <Award className="h-12 w-12 text-buttonsCustom-500" />
                                    </div>
                                  )}
                                  
                                  {/* Status Badge */}
                                  <div className="absolute top-2 right-2">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                                      certificate.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : certificate.status === 'revoked'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {certificate.status === 'active' 
                                        ? <CheckCircle className="h-3 w-3 mr-1" /> 
                                        : certificate.status === 'revoked'
                                          ? <XCircle className="h-3 w-3 mr-1" />
                                          : <Clock className="h-3 w-3 mr-1" />
                                      }
                                      {certificate.status === 'active' ? 'Active' : certificate.status === 'revoked' ? 'Revoked' : 'Expired'}
                                    </div>
                                  </div>
                                  
                                  {/* Level Badge */}
                                  <div className="absolute top-2 left-2">
                                    <Badge className="bg-buttonsCustom-600">
                                      {certificate.course.level}
                                    </Badge>
                                  </div>
                                  
                                  {/* Certificate Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                                    <div className="text-white">
                                      <h3 className="font-bold text-lg line-clamp-1">{certificate.course.title}</h3>
                                      <p className="text-xs opacity-80">Issued on: {new Date(certificate.issue_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <CardContent className="flex-grow p-4">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Award className="h-4 w-4 text-buttonsCustom-500 mt-0.5" />
                                    <div>
                                      <span className="text-xs text-gray-500">Certificate ID</span>
                                      <p className="text-sm font-medium text-buttonsCustom-700">{certificate.certificate_id}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 text-buttonsCustom-500 mt-0.5" />
                                    <div>
                                      <span className="text-xs text-gray-500">Completed on</span>
                                      <p className="text-sm font-medium">{new Date(certificate.completion_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </CardContent>
                                
                                <CardFooter className="p-4 pt-0 mt-auto">
                                  <div className="w-full flex items-center justify-between gap-2">
                                    <Button 
                                      asChild
                                      variant="default" 
                                      size="sm"
                                      className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
                                    >
                                      <Link href={`/student/certificates/view/${certificate.certificate_id}`}>
                                        View Certificate
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                      </Link>
                                    </Button>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8 border-buttonsCustom-200">
                                          <SlidersHorizontal className="h-4 w-4 text-buttonsCustom-600" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleShareCertificate(certificate)}>
                                          <Share2 className="h-4 w-4 mr-2" />
                                          Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                          <Link href={`/verify-certificate/${certificate.certificate_id}`}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Verify
                                          </Link>
                                        </DropdownMenuItem>
                                        {certificate.pdf_file && (
                                          <DropdownMenuItem asChild>
                                            <a href={certificate.pdf_file} target="_blank" rel="noopener noreferrer" download>
                                              <Download className="h-4 w-4 mr-2" />
                                              Download PDF
                                            </a>
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Load More Button */}
                        {hasMore && (
                          <div className="flex justify-center mt-8">
                            <Button 
                              onClick={loadMore}
                              variant="outline" 
                              className="border-buttonsCustom-300 text-buttonsCustom-600 hover:bg-buttonsCustom-50"
                            >
                              Load More Certificates
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-10 bg-white/80 rounded-lg border border-buttonsCustom-100 text-center">
                        <div className="w-20 h-20 rounded-full bg-buttonsCustom-50 flex items-center justify-center mb-4">
                          <Award className="h-10 w-10 text-buttonsCustom-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Found</h3>
                        <p className="text-gray-500 max-w-md mb-6">
                          {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
                            ? "No certificates match your current filters. Try adjusting your search criteria."
                            : "You haven't earned any certificates yet. Complete courses to earn certificates."}
                        </p>
                        <Button asChild className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700">
                          <Link href="/student/certificates/generate">
                            {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
                              ? "Clear Filters"
                              : "Browse Available Certificates"}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
              
              {/* Certificate Stats */}
              {!isLoading && filteredCertificates.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-8"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600">Active Certificates</p>
                            <p className="text-2xl font-bold text-green-800">
                              {certificates.filter(c => c.status === 'active').length}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-600">Expired Certificates</p>
                            <p className="text-2xl font-bold text-yellow-800">
                              {certificates.filter(c => c.status === 'expired').length}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-600">Revoked Certificates</p>
                            <p className="text-2xl font-bold text-red-800">
                              {certificates.filter(c => c.status === 'revoked').length}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Generate More Certificates Button */}
              {!isLoading && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex justify-center mt-6"
                >
                  <Button asChild className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700">
                    <Link href="/student/certificates/generate">
                      <Award className="h-4 w-4 mr-2" />
                      Generate More Certificates
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
} 