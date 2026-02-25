'use client';

import { MeshProvider as MeshSDKProvider } from "@meshsdk/react";
import "@meshsdk/react/styles.css";

export function MeshProvider({ children }: { children: React.ReactNode }) {
  return <MeshSDKProvider>{children}</MeshSDKProvider>;
} 