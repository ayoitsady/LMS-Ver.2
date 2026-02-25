const getLocationByIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.error) {
      throw new Error(data.reason || "Failed to get location from IP");
    }
    return data.country_name || "Unknown";
  } catch (error) {
    console.error("IP Geolocation error:", error);
    return "Unknown";
  }
};

const getLocationByGPS = (): Promise<string> => {
  return new Promise((resolve) => {
    // If geolocation is not supported or we're not in a browser, use IP
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(getLocationByIP());
      return;
    }

    // Set a timeout for geolocation request
    const timeoutId = setTimeout(() => {
      console.log("Geolocation request timed out, falling back to IP");
      resolve(getLocationByIP());
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      async (pos: GeolocationPosition) => {
        clearTimeout(timeoutId);
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (!data.address?.country) {
            throw new Error("Country not found in response");
          }

          resolve(data.address.country);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          resolve(getLocationByIP());
        }
      },
      async (error: GeolocationPositionError) => {
        clearTimeout(timeoutId);
        // If user denied permission or any other error, immediately fall back to IP
        console.log(`Geolocation failed (${error.message}), falling back to IP`);
        resolve(getLocationByIP());
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // Cache location for 5 minutes
      }
    );
  });
};

const GetCurrentAddress = async (): Promise<string> => {
  try {
    return await getLocationByGPS();
  } catch (error) {
    console.error("Location detection failed:", error);
    return "Unknown";
  }
};

export default GetCurrentAddress;
