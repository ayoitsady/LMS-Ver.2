"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
}

interface RazorpayClass {
  new (options: RazorpayOptions): { open: () => void };
}

declare global {
  interface Window {
    Razorpay: RazorpayClass;
  }
}

import Toast from "@/views/plugins/Toast";
import apiInstance from "@/utils/axios";

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

interface Teacher {
  id: number;
  full_name: string;
  image: string | null;
  bio: string | null;
  about: string | null;
  country: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
}

interface Coupon {
  id: number;
  code: string;
  discount: string;
  active: boolean;
  date: string;
  valid_from: string;
  valid_to: string;
  max_usage: number;
  used_count: number;
}

interface Student {
  id: number;
  full_name: string;
  email: string;
  username: string;
  date_joined: string;
  last_login: string | null;
  wallet_address: string | null;
}

interface CartOrderItem {
  id: number;
  price: string;
  tax_fee: string;
  total: string;
  initial_total: string;
  saved: string;
  applied_coupon: string | null;
  oid: string;
  date: string;
  course: Course;
  teacher: Teacher;
  coupons: Coupon[];
}

interface Order {
  id: number;
  order_items: CartOrderItem[];
  sub_total: string;
  tax_fee: string;
  total: string;
  initial_total: string;
  saved: string;
  payment_status: "pending" | "completed" | "failed";
  full_name: string | null;
  email: string | null;
  country: string | null;
  oid: string;
  date: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  student: Student;
  teachers: Teacher[];
  coupons: Coupon[];
  payment_method: string | null;
  payment_date: string | null;
  is_refunded: boolean;
  refund_amount: string | null;
  refund_date: string | null;
}
export default function Checkout() {
  const [order, setOrder] = useState<Order | null>(null);
  const [coupon, setCoupon] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const fetchOrder = useCallback(async () => {
    try {
      const response = await apiInstance.get<Order>(
        `order/checkout/${params.oid}/`
      );
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to load order details",
      });
    }
  }, [params.oid]);

  const applyCoupon = async () => {
    if (!order) return;

    const formData = new FormData();
    formData.append("order_oid", order.oid);
    formData.append("coupon_code", coupon);

    try {
      const response = await apiInstance.post(`order/coupon/`, formData);
      await fetchOrder(); // Refresh order data
      Toast().fire({
        icon: response.data.icon,
        title: response.data.message,
      });
    } catch (error: unknown) {
      console.error("Coupon application error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      Toast().fire({
        icon: "error",
        title: axiosError.response?.data?.message || "Failed to apply coupon",
      });
    }
  };

  useEffect(() => {
    fetchOrder();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [fetchOrder]);

  //   const initialOptions = {
  //     clientId: PAYPAL_CLIENT_ID,
  //     currency: "USD",
  //     intent: "capture",
  //   };

  //   const payWithStripe = (event: React.MouseEvent<HTMLButtonElement>) => {
  //     setPaymentLoading(true);
  //     const form = event.currentTarget.form;
  //     if (form) {
  //       form.submit();
  //     }
  //   };
  const initiateRazorpay = async () => {
    if (!order) return;

    setPaymentLoading(true);

    try {
      const response = await apiInstance.post(
        `/payment/razorpay-checkout/${order.oid}/`
      );
      const checkoutData = response.data;

      // Define RazorpayResponse type
      interface RazorpayResponse {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }

      // Inject handler into backend-sent data
      const options = {
        ...checkoutData,
        prefill: {
          name: order.full_name || order.student.full_name || "",
          email: order.email || order.student.email || "",
        },
        theme: {
          color: "#FF9999", // Primary color for buttons and other elements
          backdrop_color: "#ffffff", // Background color
          hide_topbar: false, // Show/hide the top bar
        },
        modal: {
          confirm_close: true, // Confirm before closing the window
          escape: true, // Allow closing with Esc key
          animation: true, // Enable animations
        },
        notes: {
          order_id: order.oid,
          customer_name: order.full_name || order.student.full_name || "",
          customer_email: order.email || order.student.email || "",
          date: order.date || "",
          sub_total: order.sub_total || "",
          tax_fee: order.tax_fee || "",
          total: order.total || "",
          country: order.country || "",
        },
        handler: async function (response: RazorpayResponse) {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_oid: order.oid,
          };

          try {
            await apiInstance.post(`/payment/payment-success/`, verifyData);
            Toast().fire({ icon: "success", title: "Payment Successful!" });
            
            // Redirect to payment success page

            
            router.push(`/payment-success?order_id=${order.oid}`);
          } catch (err) {
            console.error("Verification failed", err);
            Toast().fire({
              icon: "error",
              title: "Payment verification failed",
            });
          } finally {
            setPaymentLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      Toast().fire({ icon: "error", title: "Unable to initiate Razorpay" });
      setPaymentLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-primaryCustom-100">
        <div className="container mx-auto py-8">
          <div className="animate-pulse bg-primaryCustom-200 rounded-3 p-8">
            <div className="h-8 bg-primaryCustom-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-primaryCustom-300 rounded w-3/4"></div>
              <div className="h-4 bg-primaryCustom-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primaryCustom-100">
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="row">
            <div className="col-12">
              <div className="bg-primaryCustom-200 p-6 text-center rounded-3 shadow-sm">
                <h1 className="m-0 text-2xl font-bold text-gray-800">
                  Checkout
                </h1>
                <div className="flex justify-center mt-2">
                  <nav aria-label="breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                      <li>
                        <Link
                          href="/"
                          className="text-gray-600 hover:text-buttonsCustom-700 transition-colors"
                        >
                          Home
                        </Link>
                      </li>
                      <li className="text-gray-400">/</li>
                      <li>
                        <Link
                          href="/courses"
                          className="text-gray-600 hover:text-buttonsCustom-700 transition-colors"
                        >
                          Courses
                        </Link>
                      </li>
                      <li className="text-gray-400">/</li>
                      <li>
                        <Link
                          href="/cart"
                          className="text-gray-600 hover:text-buttonsCustom-700 transition-colors"
                        >
                          Cart
                        </Link>
                      </li>
                      <li className="text-gray-400">/</li>
                      <li className="text-buttonsCustom-700 font-medium">
                        Checkout
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between bg-buttonsCustom-100 text-buttonsCustom-900 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Review your courses before payment</span>
                </div>
                <button className="text-buttonsCustom-700 hover:text-buttonsCustom-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h5 className="text-lg font-semibold mb-4">Courses</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {order.order_items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center">
                              <div className="w-24 h-16 mb-3 md:mb-0 md:mr-4 flex-shrink-0 relative">
                                <Image
                                  src={item.course.image}
                                  alt={item.course.title}
                                  fill
                                  sizes="(max-width: 768px) 96px, 96px"
                                  className="object-cover rounded"
                                  priority={index === 0}
                                />
                              </div>
                              <div>
                                <h6 className="text-md font-medium text-gray-800">
                                  {item.course.title}
                                </h6>
                                <p className="text-sm text-gray-500 mt-1">
                                  Instructor: {item.teacher.full_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-semibold text-green-600">
                                ₹ {parseFloat(item.price).toFixed(2)}
                              </span>
                              {parseFloat(item.saved) > 0 && (
                                <span className="text-sm text-green-500">
                                  Saved ₹ {parseFloat(item.saved).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Link
                  href="/cart"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buttonsCustom-500"
                >
                  Edit Cart
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 -mr-1 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h5 className="text-lg font-semibold mb-4">Personal Details</h5>
                <form className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="yourName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your name *
                    </label>
                    <input
                      type="text"
                      id="yourName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-buttonsCustom-500 focus:border-buttonsCustom-500"
                      readOnly
                      value={order.full_name || order.student.full_name || ""}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="emailInput"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address *
                    </label>
                    <input
                      type="email"
                      id="emailInput"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-buttonsCustom-500 focus:border-buttonsCustom-500"
                      readOnly
                      value={order.email || order.student.email || ""}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="countryInput"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Select country *
                    </label>
                    <input
                      type="text"
                      id="countryInput"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-buttonsCustom-500 focus:border-buttonsCustom-500"
                      readOnly
                      value={order.country || ""}
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold">Order Summary</h4>
                  <span className="text-sm text-gray-500">
                    Order #: {order.oid}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payment_status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.payment_status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex mt-1">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-buttonsCustom-500 focus:border-buttonsCustom-500"
                    placeholder="COUPON CODE"
                    onChange={(e) => setCoupon(e.target.value)}
                    value={coupon}
                  />
                  <button
                    onClick={applyCoupon}
                    type="button"
                    className="px-4 py-2 bg-buttonsCustom-500 text-white rounded-r-md hover:bg-buttonsCustom-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buttonsCustom-500"
                  >
                    Apply
                  </button>
                </div>

                {order.coupons.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Applied Coupons
                    </h5>
                    <div className="space-y-2">
                      {order.coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="flex justify-between items-center bg-green-50 p-2 rounded"
                        >
                          <span className="text-sm font-medium text-green-800">
                            {coupon.code}
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            -{coupon.discount}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-primaryCustom-50 p-4 rounded-lg shadow-sm mt-4">
                  <h4 className="text-lg font-bold mb-3">Cart Total</h4>
                  <ul className="space-y-2 mb-4">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Sub Total</span>
                      <span className="text-gray-800">
                        ₹ {parseFloat(order.sub_total).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -₹ {parseFloat(order.saved).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">
                        ₹ {parseFloat(order.tax_fee).toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">Total</span>
                      <span className="text-lg text-buttonsCustom-700">
                        ₹ {parseFloat(order.total).toFixed(2)}
                      </span>
                    </li>
                    {parseFloat(order.saved) > 0 && (
                      <li className="flex justify-between items-center text-sm text-green-600">
                        <span>You saved</span>
                        <span>₹ {parseFloat(order.saved).toFixed(2)}</span>
                      </li>
                    )}
                  </ul>
                  <div className="space-y-3">
                    <form method="POST">
                      {paymentLoading ? (
                        <button
                          type="submit"
                          disabled
                          className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Processing
                          <svg
                            className="animate-spin ml-2 h-4 w-4 text-white"
                            xmlns="http
                                :           //www.w3.org/
                    2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={initiateRazorpay}
                          disabled={paymentLoading}
                          className="mt-6 px-6 py-3 bg-buttonsCustom-700 text-white rounded hover:bg-buttonsCustom-800 transition duration-200"
                        >
                          {paymentLoading
                            ? "Processing..."
                            : "Pay with Razorpay"}
                        </button>
                      )}
                    </form>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    By proceeding to payment, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-buttonsCustom-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-buttonsCustom-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
