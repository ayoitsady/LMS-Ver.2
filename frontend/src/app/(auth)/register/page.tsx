"use client";

import { useEffect, useState } from "react";
import { register } from "@/utils/auth";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, XCircle as XCircleLucide } from "lucide-react";
import { 
  LockClosedIcon, 
  ArrowPathIcon, 
  UserIcon, 
  AtSymbolIcon,
 
  FingerPrintIcon
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import Cookie from "js-cookie";
import { CardanoWallet, useWallet } from "@meshsdk/react";

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  teacher_id: number;
  wallet_address: string;
}

interface ValidationErrors {
  fullname?: string;
  email?: string;
  password?: string;
  password2?: string;
  wallet_address?: string;
}

function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [wallet_address, setWallet_Address] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const { connected, wallet } = useWallet();

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  const getWalletAddress = async () => {
    if (connected && wallet) {
      try {
        // Check if the wallet object has the required methods
        if (typeof wallet.getChangeAddress !== 'function') {
          console.error("Wallet does not support getChangeAddress method");
          return;
        }

        const changeAddress = await wallet.getChangeAddress();
        if (changeAddress) {
          setWallet_Address(changeAddress);
          // Clear wallet address validation error if it exists
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.wallet_address;
            return newErrors;
          });
        }
      } catch (err) {
        console.error("Error getting wallet address:", err);
        setWallet_Address("");
        setValidationErrors(prev => ({
          ...prev,
          wallet_address: "Failed to get wallet address. Please try again."
        }));
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    getWalletAddress();
  }, [connected, wallet]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordValidation(validation);

    if (!validation.minLength) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!validation.hasUppercase) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!validation.hasLowercase) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!validation.hasNumber) {
      errors.push("Password must contain at least one number");
    }
    if (!validation.hasSpecial) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  const validateEmail = (email: string): string[] => {
    const errors: string[] = [];
    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address");
    }
    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, password: errors.join(", ") }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }

    if (password2) {
      if (newPassword !== password2) {
        setValidationErrors(prev => ({ ...prev, password2: "Passwords do not match" }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.password2;
          return newErrors;
        });
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPass = e.target.value;
    setPassword2(confirmPass);
    
    if (confirmPass !== password) {
      setValidationErrors(prev => ({ ...prev, password2: "Passwords do not match" }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password2;
        return newErrors;
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    const errors = validateEmail(newEmail);
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, email: errors.join(", ") }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleFullnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFullname = e.target.value;
    setFullname(newFullname);
    
    if (!newFullname.trim()) {
      setValidationErrors(prev => ({ ...prev, fullname: "Full name is required" }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fullname;
        return newErrors;
      });
    }
  };

  // const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newWalletAddress = e.target.value;
  //   setWallet_Address(newWalletAddress);
    
  //   if (!newWalletAddress.trim()) {
  //     setValidationErrors(prev => ({ ...prev, wallet_address: "Wallet address is required" }));
  //   } else {
  //     setValidationErrors(prev => {
  //       const newErrors = { ...prev };
  //       delete newErrors.wallet_address;
  //       return newErrors;
  //     });
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate all fields before submission
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(password);
    const newValidationErrors: ValidationErrors = {};

    if (emailErrors.length > 0) {
      newValidationErrors.email = emailErrors.join(", ");
    }
    if (passwordErrors.length > 0) {
      newValidationErrors.password = passwordErrors.join(", ");
    }
    if (password !== password2) {
      newValidationErrors.password2 = "Passwords do not match";
    }
    if (!fullname.trim()) {
      newValidationErrors.fullname = "Full name is required";
    }
    if (!wallet_address.trim()) {
      newValidationErrors.wallet_address = "Wallet address is required";
    }

    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await register(
        fullname,
        email,
        password,
        password2,
        wallet_address
      );
      
      if (error) {
        setError(typeof error === 'string' ? error : JSON.stringify(error));
      } else {
        // Get the access token to check the teacher_id
        const access_token = Cookie.get("access_token");
        if (access_token) {
          try {
            const decoded = jwtDecode<DecodedToken>(access_token);
            // Redirect based on teacher_id
            if (decoded.teacher_id > 0) {
              router.push("/instructor/dashboard/");
            } else {
              router.push("/student/dashboard/");
            }
          } catch (err) {
            console.error("Error decoding token:", err);
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20">
          {/* Gradient Header */}
          <div className="h-2 bg-gradient-to-r from-buttonsCustom-800 to-buttonsCustom-600" />

          <div className="p-8 space-y-6">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-buttonsCustom-50">
                <FingerPrintIcon className="h-6 w-6 text-buttonsCustom-700" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Your Decentralized Identity
              </h1>
              <p className="text-gray-600">
                Register to access blockchain learning resources
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-700 p-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fullname}
                    onChange={handleFullnameChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/70 
                            placeholder-gray-400 focus:ring-2 focus:ring-buttonsCustom-300 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                {validationErrors.fullname && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fullname}</p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/70 
                            placeholder-gray-400 focus:ring-2 focus:ring-buttonsCustom-300 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </motion.div>

              {/* Wallet Connection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connect Your Cardano Wallet
                </label>
                <div className="relative">
                  <CardanoWallet 
                    label="Connect Wallet"
                    isDark={false}
                    onConnected={() => {
                      console.log("Wallet connected!");
                      // Trigger wallet address fetch when connected
                      if (wallet) {
                        getWalletAddress();
                      }
                    }}
                  />
                </div>
                {wallet_address && (
                  <p className="mt-2 text-sm text-gray-600">
                    Connected Address: {wallet_address.slice(0, 20)}...{wallet_address.slice(-8)}
                  </p>
                )}
                {validationErrors.wallet_address && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.wallet_address}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white/70 
                            placeholder-gray-400 focus:ring-2 focus:ring-buttonsCustom-300 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-2 space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidation.minLength ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircleLucide className="h-4 w-4" />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidation.hasUppercase ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircleLucide className="h-4 w-4" />
                      )}
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidation.hasLowercase ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircleLucide className="h-4 w-4" />
                      )}
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidation.hasNumber ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircleLucide className="h-4 w-4" />
                      )}
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidation.hasSpecial ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircleLucide className="h-4 w-4" />
                      )}
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={password2}
                    onChange={handleConfirmPasswordChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white/70 
                            placeholder-gray-400 focus:ring-2 focus:ring-buttonsCustom-300 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password2 && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password2}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  type="submit"
                  disabled={isLoading || !fullname.trim() || !email.trim() || !password.trim() || !password2.trim() || !wallet_address.trim() || Object.keys(validationErrors).length > 0}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-md transition-all
                          ${isLoading || !fullname.trim() || !email.trim() || !password.trim() || !password2.trim() || !wallet_address.trim() || Object.keys(validationErrors).length > 0
                            ? 'bg-buttonsCustom-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-buttonsCustom-700 to-buttonsCustom-600 hover:from-buttonsCustom-800 hover:to-buttonsCustom-700'
                          }`}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <span className="text-white font-medium flex items-center gap-2">
                      <FingerPrintIcon className="h-5 w-5" />
                      Register Identity
                    </span>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-buttonsCustom-600 hover:text-buttonsCustom-700 font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;