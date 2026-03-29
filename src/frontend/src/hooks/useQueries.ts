import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderField, OrderStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useGetOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderField[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetOrderByTracking(trackingId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<OrderField | null>({
    queryKey: ["order", trackingId],
    queryFn: async () => {
      if (!actor || !trackingId) return null;
      return actor.getOrderByTracking(trackingId);
    },
    enabled: !!actor && !isFetching && !!trackingId,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      phone: string;
      address: string;
      pincode: string;
      items: [string, bigint][];
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        params.customerName,
        params.phone,
        params.address,
        params.pincode,
        params.items,
        params.totalAmount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { trackingId: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(params.trackingId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
