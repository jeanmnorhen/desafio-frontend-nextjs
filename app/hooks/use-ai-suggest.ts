import { useMutation } from "@tanstack/react-query";
import { suggestReply } from "@/lib/api";

export function useAiSuggest() {
  return useMutation({
    mutationFn: (conversationId: string) => suggestReply(conversationId),
  });
}
