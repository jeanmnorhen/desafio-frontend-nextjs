import { useQuery } from "@tanstack/react-query";
import { getMe, type Agent } from "@/lib/api";

export function useAgent() {
  return useQuery<Agent>({
    queryKey: ["agent"],
    queryFn: getMe,
    staleTime: Infinity, // The logged in agent rarely changes
  });
}
