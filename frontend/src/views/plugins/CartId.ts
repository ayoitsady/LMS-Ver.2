"use client";

const CartId = (): string => {
  // Only access localStorage in client-side environment
  if (typeof window === 'undefined') {
    return '';
  }
  
  const generateRandomString = (): string => {
    const length: number = 6;
    const characters: string = "1234567890";
    let randomString: string = "";

    for(let i: number = 0; i < length; i++) {
      const randomIndex: number = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    localStorage.setItem('randomString', randomString);
    return randomString;
  };

  // Safely access localStorage
  try {
    const existingRandomString: string | null = localStorage.getItem("randomString");
    
    if(!existingRandomString) {
      return generateRandomString();
    }
    
    return existingRandomString;
  } catch (error) {
    // Handle any localStorage errors
    console.error("Error accessing localStorage:", error);
    return '';
  }
};

export default CartId; 