"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle, 
  Search, 
  Clock, 
  AlertTriangle,
  Award,
  User,
  Calendar,
  BookOpen,
  HelpCircle,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useAxios from "@/utils/axios";

interface VerificationSuccess {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    level: string;
    image: string | null;
  };
  user: {
    id: number;
    full_name: string | null;
    username: string;
  };
  certificate_id: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  issue_date: string;
  verification_url: string | null;
  status: 'active' | 'revoked' | 'expired';
  pdf_file: string | null;
  metadata: Record<string, unknown>;
  course_title: string;
  teacher_name: string | null;
  user_name: string | null;
  course_image: string | null;
  course_level: string;
  course_description: string;
  verified: true;
  message: string;
}

interface CertificateNFT {
  id: number;
  certificate: number;
  certificate_id: string;
  policy_id: string;
  asset_id: string;
  asset_name: string;
  tx_hash: string;
  image: string;
  minted_at: string;
  user: number;
  verified: boolean;
  message: string;
}

interface VerificationFailure {
  verified: false;
  message: string;
  status?: 'revoked' | 'expired';
}

type VerificationResult = VerificationSuccess | VerificationFailure;

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [certificateIdInput, setCertificateIdInput] = useState(certificateId as string || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [certificateNFT, setCertificateNFT] = useState<CertificateNFT | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (certificateId) {
      setCertificateIdInput(certificateId as string);
      verifyCertificate(certificateId as string);
    } else {
      setIsInitialLoad(false);
    }
  }, [certificateId]);

  const verifyCertificate = async (certId: string) => {
    if (!certId.trim()) return;
    
    setIsVerifying(true);
    setVerificationResult(null);
    setCertificateNFT(null);
    setIsInitialLoad(false);
    
    try {
      console.log(certId);
      const response = await useAxios.get(`/verify-certificate/${certId}/`);
      setVerificationResult(response.data);
      
      // If certificate verification is successful, also fetch blockchain data
      if (response.data.verified) {
        try {
          const nftResponse = await useAxios.get(`/certificate-nft/by-certificate/${certId}/`);
          setCertificateNFT(nftResponse.data);
        } catch {
          console.log("No blockchain data found for this certificate");
          // NFT data is optional, so we don't set an error state
        }
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);
      const errorWithResponse = error as { response?: { data?: { message?: string } } };
      setVerificationResult({
        verified: false,
        message: errorWithResponse.response?.data?.message || "Failed to verify certificate. The certificate might not exist or there was a server error."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(certificateIdInput);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };
  
  const pulse = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  const renderStatusIcon = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.verified) {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="rounded-full bg-green-100 p-6 mx-auto w-28 h-28 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-green-600"
            animate={pulse}
          >
            <CheckCircle className="w-14 h-14" />
          </motion.div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial="hidden"
          animate="visible" 
          variants={scaleIn}
          className="rounded-full bg-red-100 p-6 mx-auto w-28 h-28 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-red-600"
            animate={pulse}
          >
            <XCircle className="w-14 h-14" />
          </motion.div>
        </motion.div>
      );
    }
  };

  const renderVerificationDetails = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.verified) {
      const certificate = verificationResult as VerificationSuccess;
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Verification Successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{certificate.message}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInLeft}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="w-full h-full bg-gradient-to-br from-buttonsCustom-50 to-buttonsCustom-200 flex flex-col items-center justify-center p-6">
                  <motion.div 
                    className="bg-white/80 rounded-full p-4 shadow-lg mb-4"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Award className="w-12 h-12 text-buttonsCustom-600" />
                  </motion.div>
                  <div className="text-center">
                    <motion.h3 
                      className="text-sm font-semibold text-buttonsCustom-800 mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      CERTIFIED
                    </motion.h3>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Badge className="bg-buttonsCustom-600 px-3 py-1">
                        {certificate.course_level}
                      </Badge>
                    </motion.div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-buttonsCustom-100 to-transparent"></div>
                </div>
              </motion.div>
            </div>
            
            <div className="md:col-span-2">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInRight}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-900">{certificate.course_title}</h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{certificate.course_description}</p>
                
                <div className="mt-4 space-y-3">
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <User className="h-4 w-4 text-buttonsCustom-500 mr-2" />
                    <span className="text-sm text-gray-700">Issued to: <span className="font-medium">{certificate.student_name}</span></span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <User className="h-4 w-4 text-buttonsCustom-500 mr-2" />
                    <span className="text-sm text-gray-700">Instructor: <span className="font-medium">{certificate.teacher_name || "N/A"}</span></span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Calendar className="h-4 w-4 text-buttonsCustom-500 mr-2" />
                    <span className="text-sm text-gray-700">Completed on: <span className="font-medium">{new Date(certificate.completion_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Calendar className="h-4 w-4 text-buttonsCustom-500 mr-2" />
                    <span className="text-sm text-gray-700">Issued on: <span className="font-medium">{new Date(certificate.issue_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookOpen className="h-4 w-4 text-buttonsCustom-500 mr-2" />
                    <span className="text-sm text-gray-700">Course Level: <span className="font-medium">{certificate.course_level}</span></span>
                  </motion.div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                      certificate.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : certificate.status === 'revoked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {certificate.status === 'active' 
                        ? <CheckCircle className="h-3 w-3 mr-1" />
                        : certificate.status === 'revoked'
                          ? <AlertTriangle className="h-3 w-3 mr-1" />
                          : <Clock className="h-3 w-3 mr-1" />
                      }
                      {certificate.status === 'active' ? 'Certificate Active' : certificate.status === 'revoked' ? 'Certificate Revoked' : 'Certificate Expired'}
                    </div>
                  </div>
                  
                  {certificateNFT && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="flex items-center"
                    >
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium flex items-center">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Verified on Blockchain
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Blockchain Details Section */}
          {certificateNFT && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6"
            >
              <div className="flex items-center mb-4">
                <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Blockchain Verification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">NFT Asset ID:</span>
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {certificateNFT.asset_id.slice(0, 8)}...{certificateNFT.asset_id.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Policy ID:</span>
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {certificateNFT.policy_id.slice(0, 8)}...{certificateNFT.policy_id.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Asset Name:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {certificateNFT.asset_name}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Minted Date:</span>
                    <span className="text-sm text-blue-600">
                      {new Date(certificateNFT.minted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Transaction Hash:</span>
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {certificateNFT.tx_hash.slice(0, 8)}...{certificateNFT.tx_hash.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-gray-700">Blockchain Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
              
              {certificateNFT.image && (
                <div className="mt-6 text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">NFT Image</h4>
                  <div className="inline-block p-2 bg-white rounded-lg border border-blue-200">
                    <Image
                      src={certificateNFT.image}
                      alt="Certificate NFT"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Blockchain Verification Confirmed</h4>
                    <p className="text-sm text-blue-700">
                      This certificate has been verified on the Cardano blockchain. The NFT is permanently stored and cannot be altered, ensuring the authenticity and immutability of this credential.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
            <motion.h3 
              className="text-sm font-medium text-gray-700 mb-2"
              whileHover={{ color: "#4338ca" }}
            >
              Certificate Details
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div>
                <span className="text-gray-500">Certificate ID:</span>
                <span className="ml-2 font-medium text-gray-900">{certificate.certificate_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Verification Date:</span>
                <span className="ml-2 font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </motion.div>
          </div>
        </div>
      );
    } else {
      // Failed verification
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{verificationResult.message}</p>
                </div>
              </div>
            </div>
          </div>
          
          {verificationResult.status && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  {verificationResult.status === 'revoked' ? (
                    <div className="p-3 bg-amber-100 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Clock className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {verificationResult.status === 'revoked' 
                      ? 'Certificate Has Been Revoked' 
                      : 'Certificate Has Expired'}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-3">
                    <p>
                      {verificationResult.status === 'revoked'
                        ? 'This certificate has been revoked and is no longer valid. Certificates may be revoked for various reasons including policy violations, academic misconduct, or administrative errors.'
                        : 'This certificate has expired and is no longer valid. Certificates typically expire after a certain period to ensure that the holder\'s knowledge remains current and relevant.'}
                    </p>
                    
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">What This Means:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {verificationResult.status === 'revoked' ? (
                          <>
                            <li>The certificate is not recognized as valid by our institution</li>
                            <li>The skills and knowledge may still be valid, but the credential cannot be used for official purposes</li>
                            <li>The holder may be eligible to retake the course or apply for recertification</li>
                          </>
                        ) : (
                          <>
                            <li>The certificate was valid at one point but has now passed its validity period</li>
                            <li>The skills and knowledge may need to be updated through a current course</li>
                            <li>The holder may be eligible for a renewal or refresher course</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Next Steps:</h4>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-buttonsCustom-300 text-buttonsCustom-700 hover:bg-buttonsCustom-50"
                          asChild
                        >
                          <Link href="/contact-us">
                            Contact Support
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-buttonsCustom-300 text-buttonsCustom-700 hover:bg-buttonsCustom-50"
                          asChild
                        >
                          <Link href="/courses">
                            Browse Courses
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex justify-center">
            <Button
              onClick={() => setCertificateIdInput("")}
              className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
            >
              Verify Another Certificate
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <nav>
            <Button asChild variant="ghost" className="text-buttonsCustom-600 hover:text-buttonsCustom-700">
              <Link href="/">
                Home
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Certificate Verification
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of a certificate by entering the certificate ID below.
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-buttonsCustom-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-buttonsCustom-50 border-b border-buttonsCustom-100">
              <div className="flex items-center mb-2">
                <ShieldCheck className="h-5 w-5 text-buttonsCustom-600 mr-2" />
                <CardTitle className="text-buttonsCustom-800">Verify Certificate</CardTitle>
              </div>
              <CardDescription>
                Enter the certificate ID to verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Certificate ID (e.g., CERT-123456)"
                      value={certificateIdInput}
                      onChange={(e) => setCertificateIdInput(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-buttonsCustom-500"
                      disabled={isVerifying}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isVerifying || !certificateIdInput.trim()}
                    className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 min-w-[120px] transition-all duration-300"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Verification Results */}
        <AnimatePresence>
          {!isInitialLoad && (
            isVerifying ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-8"
              >
                <Loader2 className="h-8 w-8 text-buttonsCustom-600 mb-4 animate-spin" />
                <p className="text-buttonsCustom-700">Verifying certificate...</p>
              </motion.div>
            ) : verificationResult ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden border-gray-200 bg-white">
                  <CardHeader className="text-center border-b pb-6">
                    {renderStatusIcon()}
                    <CardTitle className="mt-4 text-xl">
                      {verificationResult.verified 
                        ? "Certificate Verified" 
                        : "Certificate Not Verified"}
                    </CardTitle>
                    <CardDescription>
                      {verificationResult.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {renderVerificationDetails()}
                  </CardContent>
                  <CardFooter className="border-t pt-6 flex justify-between flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCertificateIdInput("")}
                      className="border-gray-300 text-gray-700"
                    >
                      Verify Another
                    </Button>
                    
                    {verificationResult.verified && (
                      <Button
                        asChild
                        className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
                      >
                        <a href={`mailto:support@example.com?subject=Certificate%20Verification%20Help&body=Certificate%20ID:%20${certificateIdInput}`}>
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Contact Support
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        
        {/* Information Panel */}
        {!verificationResult && !isVerifying && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="h-5 w-5 text-buttonsCustom-600 mr-2" />
              About Certificate Verification
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Authentic Certificates</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Authentic certificates include detailed information about the course, student, and completion date.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
                      <XCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Invalid Certificates</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Invalid certificates may be expired, revoked, or not found in our system.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Certificate Status</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Certificates can be active, revoked, or expired based on various factors.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Need Help?</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      If you&apos;re having trouble verifying a certificate, please contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center text-sm text-gray-500">
              <p>All certificates issued by our platform can be verified through this page.</p>
              <p className="mt-1">If you have any concerns about the authenticity of a certificate, please contact us.</p>
            </div>
          </motion.div>
        )}
      </main>
     
    </div>
  );
}