"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import apiInstance from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import { MINT_API_BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";

interface Course {
  id: number;
  title: string;
  image: string;
  slug: string;
  description: string;
  price: string;
  language: string;
  level: string;
  duration: string;
  students_count: number;
  rating: number;
}

interface Order {
  id: number;
  order_items: {
    course: Course;
    oid: string;
  }[];
  total: string;
  oid: string;
  date: string;
  payment_status: string;
  enrollment_id: string;
}

function PaymentSuccessContent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [nftMinted, setNftMinted] = useState(false);
  const [mintingLoading, setMintingLoading] = useState(false);
  const [checkingAsset, setCheckingAsset] = useState(true);
  const hasAttemptedMint = useRef(false);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const userData = UserData();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      try {
        const response = await apiInstance.get(`order/checkout/${orderId}/`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  // Check for NFT asset ID after order is loaded
  useEffect(() => {
    const checkAsset = async () => {
      if (!order) return;
      setCheckingAsset(true);
      try {
        const res = await apiInstance.get(`nft/asset-id/${order.enrollment_id}/`);
        if (res.data.asset_id) {
          setNftMinted(true);
        } else {
          setNftMinted(false);
        }
      } catch {
        setNftMinted(false);
      } finally {
        setCheckingAsset(false);
      }
    };
    if (order) checkAsset();
  }, [order]);

  const handleMintNFT = async () => {
    if (!order || !userData || mintingLoading || hasAttemptedMint.current) return;
    hasAttemptedMint.current = true;
    setMintingLoading(true);
    try {
      const courseDetailsResponse = await apiInstance.get(
        `student/course-detail/${userData.user_id}/${order.enrollment_id}/`
      );
      const mintRequestData = {
        courseId: String(courseDetailsResponse.data.course.course_id),
        userId: String(userData.user_id),
        enrollmentId: String(courseDetailsResponse.data.enrollment_id),
        destinationAddress: courseDetailsResponse.data.user.wallet_address,
        image: courseDetailsResponse.data.course.image,
        prefix: courseDetailsResponse.data.course.slug
      };
      const mintResponse = await axios.post(`${MINT_API_BASE_URL}api/mint`, JSON.stringify(mintRequestData), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      // Send minting response to our backend
      const backendRequestData = {
        enrollment_id: mintResponse.data.enrollmentId || order.enrollment_id,
        policy_id: mintResponse.data.policyId || "",
        asset_id: mintResponse.data.assetId || "",
        asset_name: mintResponse.data.assetName || "",
        tx_hash: mintResponse.data.txHash || "",
        image: mintResponse.data.image || courseDetailsResponse.data.course.image
      };
      try {
        await apiInstance.post('nft/mint/', backendRequestData);
        setNftMinted(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error saving NFT minting details to backend:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            requestData: backendRequestData
          });
        } else {
          console.error('Error saving NFT minting details to backend:', error);
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error minting NFT:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error('Error minting NFT:', error);
      }
    } finally {
      setMintingLoading(false);
    }
  };

  if (loading || checkingAsset) {
    return (
      <div className="min-h-screen bg-primaryCustom-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-buttonsCustom-700"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-primaryCustom-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <Link
            href="/"
            className="text-buttonsCustom-700 hover:text-buttonsCustom-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primaryCustom-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. You are now enrolled in your courses.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.oid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">₹{parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
            <div className="space-y-6">
              {order.order_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="relative w-24 h-24">
                    <Image
                      src={item.course.image}
                      alt={item.course.title}
                      fill
                      sizes="96px"
                      className="object-cover rounded-lg"
                      priority={index === 0}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {item.course.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{item.course.duration}</span>
                      <span>•</span>
                      <span>{item.course.level}</span>
                      <span>•</span>
                      <span>{item.course.language}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-buttonsCustom-700 hover:bg-buttonsCustom-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buttonsCustom-500"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleMintNFT}
              disabled={mintingLoading || nftMinted || hasAttemptedMint.current}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                nftMinted || hasAttemptedMint.current
                  ? 'bg-green-600 cursor-not-allowed' 
                  : 'bg-buttonsCustom-700 hover:bg-buttonsCustom-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buttonsCustom-500'
              }`}
            >
              {mintingLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Minting...
                </>
              ) : nftMinted ? (
                'NFT Minted'
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primaryCustom-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-buttonsCustom-700"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 