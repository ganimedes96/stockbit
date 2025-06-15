import type { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import type { QueryKeys } from "@/lib/tanstack-query/keys";
import { ResponseServerAction, StatusServer } from "./types";

export const handleServerActionResponse = async <T = undefined>(
  client: QueryClient,
  response: ResponseServerAction<T>,
  queryKeys?: QueryKeys[],
  router?: ReturnType<typeof useRouter>,
  redirectUrl?: string
) => {
  if (response.status === StatusServer.empty) {
    return;
  }

  if (response.status === StatusServer.error) {
    if (response.message.includes("Limite")) {
      toast.error(response.message, {
        action: {
          label: "Upgrade",
          onClick: () => {
            if (router) {
              router.push("/upgrade");
            }
          },
        },
      });
      return;
    }
    toast.error(response.message);
  }
  if (response.status === StatusServer.success) {
    toast.success(response.message);
    if (queryKeys) {
      await Promise.all(
        queryKeys.map((query) =>
          client.invalidateQueries({
            queryKey: [query],
          })
        )
      );
    }
    if (router && redirectUrl) {
      router.push(redirectUrl);
    }
  }
};
