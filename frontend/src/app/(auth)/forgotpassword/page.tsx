"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiInstance from "@/utils/axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError(null);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email format");
      return;
    }

    setIsLoading(true);
    
    apiInstance
      .get(`user/password-reset/${email}/`)
      .then(() => {
        Swal.fire({
          title: "Check Your Email!",
          html: `
            <div class="text-center">
              <div class="mx-auto mb-4 h-16 w-16 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p>We've sent password reset instructions to <strong>${email}</strong></p>
              <p class="mt-2 text-sm text-gray-600">If you don't see the email, check your spam folder.</p>
            </div>
          `,
          confirmButtonColor: "#FF8080",
          backdrop: `
            rgba(0,0,0,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
          `
        });
        router.push("/login");
      })
      .catch(() => {
        setError("This email isn't registered. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Gradient Header */}
        <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />
        
        <div className="p-8">
          {/* Icon and Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-buttonsCustom-50 mb-4">
              <KeyRound className="h-10 w-10 text-buttonsCustom-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email to reset your password.
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-buttonsCustom-100 focus:border-buttonsCustom-300 transition-all"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-sm text-white font-medium
                  ${isLoading
                    ? "bg-buttonsCustom-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-buttonsCustom-700 to-buttonsCustom-800 hover:from-buttonsCustom-800 hover:to-buttonsCustom-900"
                  } transition-all`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Remember your password?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-medium text-buttonsCustom-600 hover:text-buttonsCustom-700 hover:underline focus:outline-none"
            >
              Sign in here
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;