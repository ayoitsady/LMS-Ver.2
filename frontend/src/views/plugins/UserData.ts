import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";

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

function UserData(): DecodedToken | null {
  const access_token = Cookie.get("access_token");
  const refresh_token = Cookie.get("refresh_token");

  if (access_token && refresh_token) {
    try {
      const decoded = jwtDecode<DecodedToken>(refresh_token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
}

export default UserData;
