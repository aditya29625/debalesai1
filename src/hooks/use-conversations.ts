"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Conversation {
  _id: string;
  title: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  role: "user" | "assistant" | "step";
  content: string;
  stepType?: string;
  createdAt: string;
}

interface SendMessageResponse {
  userMessage: Message;
  stepMessages: Message[];
  assistantMessage: Message;
}

export function useConversations(slug: string) {
  return useQuery<Conversation[]>({
    queryKey: ["projects", slug, "conversations"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/conversations`);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateConversation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch(`/api/projects/${slug}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json() as Promise<Conversation>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", slug, "conversations"] });
    },
  });
}

export function useMessages(slug: string, conversationId: string) {
  return useQuery<Message[]>({
    queryKey: ["projects", slug, "conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/conversations/${conversationId}/messages`
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!slug && !!conversationId,
  });
}

export function useSendMessage(slug: string, conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(
        `/api/projects/${slug}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) throw new Error("Failed to send message");
      return res.json() as Promise<SendMessageResponse>;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projects", slug, "conversations", conversationId, "messages"],
      });
      qc.invalidateQueries({ queryKey: ["projects", slug, "conversations"] });
    },
  });
}
