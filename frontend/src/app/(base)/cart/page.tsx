"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import {
  Trash2,
  ArrowRight,
  ShoppingCart,
  Home,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiInstance from "@/utils/axios";
import CartId from "@/views/plugins/CartId";
import Toast from "@/views/plugins/Toast";
import Swal from "sweetalert2";
import UserData from "@/views/plugins/UserData";

interface CartItem {
  id: string;
  price: number;
  course: {
    title: string;
    image: string;
  };
}

interface CartStats {
  price?: number;
  tax?: number;
  total?: number;
}

interface BioData {
  full_name: string;
  email: string;
  country: string;
}

const Cart = () => {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartStats, setCartStats] = useState<CartStats>({});
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();
  const [bioData, setBioData] = useState<BioData>({
    full_name: "",
    email: "",
    country: "",
  });
  const userId = UserData()?.user_id || 0;

  const fetchCartItems = useCallback(async () => {
    try {
      const [cartRes, statsRes] = await Promise.all([
        apiInstance.get<CartItem[]>(`course/cart-list/${CartId()}/`),
        apiInstance.get<CartStats>(`cart/stats/${CartId()}/`),
      ]);
      setCart(cartRes.data);
      setCartStats(statsRes.data);
      await refreshCart();
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiInstance.delete(
        `course/cart-item-delete/${CartId()}/${itemId}/`
      );
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      await fetchCartItems();
      Toast().fire({ title: "Removed From Cart", icon: "success" });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleBioDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBioData({
      ...bioData,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioData.full_name || !bioData.email || !bioData.country) {
      Toast().fire({
        icon: "warning",
        title: "Please fill all required fields",
      });
      return;
    }
    const cartId = CartId();
    if (!cartId) {
      Swal.fire({ icon: "error", title: "Cart ID not found" });
      return;
    }

    if (!userId) {
      Swal.fire({ icon: "error", title: "User authentication required" });
      return;
    }

    const formData = new FormData();
    formData.append("full_name", bioData.full_name);
    formData.append("email", bioData.email);
    formData.append("country", bioData.country);
    formData.append("cart_id", cartId);
    formData.append("user_id", userId.toString());

    try {
      const response = await apiInstance.post<{ order_oid: string }>(
        "order/create-order/",
        formData
      );
      router.push(`/checkout/${response.data.order_oid}`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Order creation failed",
      });
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryCustom-300 to-primaryCustom-700">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-white">Your Shopping Cart</h1>
          <nav className="flex items-center space-x-2 text-sm text-buttonsCustom-200">
            <Link href="/" className="hover:text-white flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Cart</span>
          </nav>
        </div>

        <form onSubmit={createOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Section */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <CardHeader className="text-lg font-semibold border-b border-buttonsCustom-200">
                  <div className="flex items-center space-x-2 text-buttonsCustom-900">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-buttonsCustom-800" htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={bioData.full_name}
                        onChange={handleBioDataChange}
                        placeholder="Enter your full name"
                        className="border-buttonsCustom-300 focus:ring-buttonsCustom-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-buttonsCustom-800" htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={bioData.email}
                        onChange={handleBioDataChange}
                        placeholder="your.email@example.com"
                        className="border-buttonsCustom-300 focus:ring-buttonsCustom-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-buttonsCustom-800" htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={bioData.country}
                        onChange={handleBioDataChange}
                        placeholder="Enter your country"
                        className="border-buttonsCustom-300 focus:ring-buttonsCustom-500"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <CardHeader className="text-lg font-semibold border-b border-buttonsCustom-200 text-buttonsCustom-900">
                  Your Courses ({cart.length})
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4"
                        >
                          <Skeleton className="h-20 w-28 rounded-lg bg-buttonsCustom-100" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px] bg-buttonsCustom-100" />
                            <Skeleton className="h-4 w-[100px] bg-buttonsCustom-100" />
                          </div>
                          <Skeleton className="h-10 w-10 rounded-full bg-buttonsCustom-100" />
                        </div>
                      ))
                  ) : cart.length === 0 ? (
                    <Alert className="bg-buttonsCustom-50 border-buttonsCustom-200">
                      <AlertDescription className="text-center py-8">
                        <div className="space-y-4">
                          <ShoppingCart className="h-12 w-12 mx-auto text-buttonsCustom-400" />
                          <p className="text-buttonsCustom-700">Your cart is empty</p>
                          <Button asChild variant="outline" className="border-buttonsCustom-600 text-buttonsCustom-600 hover:bg-buttonsCustom-50">
                            <Link href="/courses" className="space-x-2">
                              <span>Browse Courses</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-4 hover:bg-buttonsCustom-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative h-20 w-28 rounded-lg overflow-hidden border border-buttonsCustom-200">
                            <Image
                              src={item.course.image}
                              alt={item.course.title}
                              fill
                              className="object-cover"
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-buttonsCustom-900 hover:text-buttonsCustom-700">
                              {item.course.title}
                            </h3>
                            <Badge variant="outline" className="mt-2 border-buttonsCustom-300 text-buttonsCustom-700">
                              ₹ {item.price}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-buttonsCustom-700 hover:bg-buttonsCustom-100 hover:text-buttonsCustom-900"
                          onClick={() => handleRemoveItem(item.id)}
                          type="button"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <CardHeader className="text-lg font-semibold border-b border-buttonsCustom-200 text-buttonsCustom-900">
                  Order Summary
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-buttonsCustom-800">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ₹ {cartStats.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-buttonsCustom-800">
                    <span>Tax:</span>
                    <span className="font-medium">
                    ₹ {cartStats.tax?.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="my-4 bg-buttonsCustom-200" />
                  <div className="flex justify-between font-semibold text-buttonsCustom-900">
                    <span>Total:</span>
                    <span className="text-buttonsCustom-700">
                    ₹ {cartStats.total?.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg bg-gradient-to-r from-buttonsCustom-600 to-buttonsCustom-700 hover:from-buttonsCustom-700 hover:to-buttonsCustom-800"
                  >
                    Complete Checkout
                  </Button>
                  <p className="text-sm text-center text-buttonsCustom-600">
                    Secure payment processing powered by blockchain technology
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cart;