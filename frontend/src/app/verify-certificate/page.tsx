"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Search,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CertificateVerificationLandingPage() {
  const [certificateId, setCertificateId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateId.trim()) {
      router.push(`/verify-certificate/${certificateId.trim()}`);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 flex flex-col">
      
      
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
          className="mb-12"
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
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Certificate ID (e.g., CERT-123456)"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-buttonsCustom-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!certificateId.trim()}
                    className="bg-buttonsCustom-600 hover:bg-buttonsCustom-700 min-w-[120px] transition-all duration-300"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Please enter the certificate ID found at the bottom of your certificate.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Information Panel */}
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
      </main>
      
     
    </div>
  );
} 