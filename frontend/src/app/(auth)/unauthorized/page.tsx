"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

const REDIRECT_DELAY = 5; // seconds

const Unauthorized = () => {
  const router = useRouter();
  const progressControls = useAnimation();

  useEffect(() => {
    progressControls.start({
      width: "100%",
      transition: { duration: REDIRECT_DELAY, ease: "linear" },
    });

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, REDIRECT_DELAY * 1000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [router, progressControls]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="p-8">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={progressControls}
              className="h-full bg-red-600 rounded-full"
            />
          </div>

          {/* Animated X icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-8"
          >
            <XCircle className="h-10 w-10 text-red-600" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              You are not logged in. To access any content of the website, please login or register. Redirecting in {REDIRECT_DELAY} seconds...
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="w-full py-3 px-4 bg-buttonsCustom-800 hover:bg-buttonsCustom-600 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Go to Login Now
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/50 px-6 py-4 text-center">
          <p className="text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-buttonsCustom-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized; 