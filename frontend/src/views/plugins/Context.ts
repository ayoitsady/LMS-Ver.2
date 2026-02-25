// In your context.ts
import { createContext, Dispatch, SetStateAction } from "react";

export const CartContext = createContext<[number, Dispatch<SetStateAction<number>>]>([
  0,
  () => {}, // Default setter function
] as const);

interface ProfileData {
  id?: number;
  name?: string;
  email?: string;
  teacher_id?: number;
  image: string;
  full_name: string;
  about: string;
  country: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  stackoverflow?: string;
  medium?: string;
  dev?: string;
  dribbble?: string;
  behance?: string;
  pinterest?: string;
  reddit?: string;
  tumblr?: string;
  vimeo?: string;
  soundcloud?: string;
  spotify?: string;
  twitch?: string;
  discord?: string;
  telegram?: string;
  whatsapp?: string;
  skype?: string;
  zoom?: string;
  slack?: string;
  teams?: string;
  google?: string;
  apple?: string;
  microsoft?: string;
  amazon?: string;
  paypal?: string;
  stripe?: string;
  bitcoin?: string;
  ethereum?: string;
  litecoin?: string;
  dogecoin?: string;
  tether?: string;
  binance?: string;
  coinbase?: string;
  kraken?: string;
  gemini?: string;
  bitfinex?: string;
  bitstamp?: string;
  poloniex?: string;
  bittrex?: string;
  huobi?: string;
  kucoin?: string;
  okex?: string;
  bybit?: string;
  ftx?: string;
  deribit?: string;
  bitmex?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  jti?: string;
}

const defaultProfileData: ProfileData = {
  id: undefined,
  name: undefined,
  email: undefined,
  teacher_id: undefined,
  image: "/images/default-avatar.png",
  full_name: "Student Name",
  about: "Welcome to your student dashboard!",
  country: "",
  username: undefined,
  token_type: undefined,
  exp: undefined,
  iat: undefined,
  jti: undefined
};

export const ProfileContext = createContext<[ProfileData, Dispatch<SetStateAction<ProfileData>>]>([
  defaultProfileData,
  () => {},
] as const);