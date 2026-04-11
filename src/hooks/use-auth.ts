"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

async function fetchMe(): Promise<{ user: AuthUser | null }> {
  const res = await fetch("/api/auth/me");
  return res.json();
}

async function fetchUsers(): Promise<AuthUser[]> {
  const res = await fetch("/api/auth/users");
  return res.json();
}

async function loginAs(userId: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

async function logout(): Promise<void> {
  await fetch("/api/auth/login", { method: "DELETE" });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["auth", "users"],
    queryFn: fetchUsers,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginAs,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
