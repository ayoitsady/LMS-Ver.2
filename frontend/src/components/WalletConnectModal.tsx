'use client';

import { CardanoWallet, useWallet } from "@meshsdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  wallet_address: string;
  image?: string;
  about?: string;
  country?: string;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { wallet, disconnect } = useWallet();
  const { allUserData } = useAuthStore();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [addressMismatch, setAddressMismatch] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = UserData()?.user_id;
        if (userId) {
          const response = await useAxios.get(`user/profile/${userId}/`);
          setUserProfile(response.data);
          console.log("Fetched User Profile:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const checkWalletAddress = async () => {
      if (wallet) {
        try {
          // Check if the wallet object has the required methods
          if (typeof wallet.getUsedAddresses !== 'function') {
            console.error("Wallet does not support getUsedAddresses method");
            return;
          }

          const usedAddresses = await wallet.getUsedAddresses();
          if (usedAddresses && usedAddresses.length > 0) {
            const currentAddress = usedAddresses[0];
            setWalletAddress(currentAddress);
            
            // Debug logs
            console.log("Current wallet address:", currentAddress);
            console.log("User Profile Data:", userProfile);
            console.log("Auth Store Data:", allUserData);
            
            // Compare connected wallet with registered wallet
            if (allUserData?.wallet_address && allUserData.wallet_address !== currentAddress) {
              setAddressMismatch(true);
              // Disconnect wallet if addresses don't match
              disconnect();
            } else {
              setAddressMismatch(false);
            }
          }
        } catch (err) {
          console.error("Error getting wallet address:", err);
          // Add user-friendly error message
          setWalletAddress("");
          setAddressMismatch(false);
        }
      }
    };

    checkWalletAddress();
  }, [wallet, allUserData, userProfile, disconnect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Connect Your Wallet</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning Message */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You need to connect your Cardano wallet to interact with the application. This is required for all blockchain-related features.
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Connection */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Select your preferred wallet to connect:
                </p>
                <CardanoWallet 
                  label="Connect Wallet"
                  isDark={false}
                  onConnected={() => {
                    if (!addressMismatch) {
                      onClose();
                    }
                  }}
                />
              </div>

              {/* Connected Address Display */}
              {walletAddress && !addressMismatch && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Connected Address:</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {walletAddress.slice(0, 20)}...{walletAddress.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 