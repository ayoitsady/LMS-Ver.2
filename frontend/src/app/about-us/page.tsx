"use client";

import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-buttonsCustom-800 mb-6">About Us</h1>
          <p className="text-gray-700 mb-4">
            We are a cutting-edge educational platform dedicated to blockchain and Web3 technology education.
            Our mission is to make high-quality learning resources accessible to everyone interested in the future of technology.
          </p>
          <p className="text-gray-700 mb-4">
            We offer comprehensive courses taught by industry experts, designed to take you from beginner to expert.
          </p>
          <div className="mt-6">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-buttonsCustom-600 hover:bg-buttonsCustom-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 