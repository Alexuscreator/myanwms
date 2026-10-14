"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.currentUser);

  useEffect(() => {
    if (user) router.replace("/inventory");
    else router.replace("/login");
  }, [user, router]);

  return null;
}
