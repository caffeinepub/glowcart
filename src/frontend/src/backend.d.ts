import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    productId: string;
    quantity: bigint;
}
export interface OrderField {
    customerName: string;
    status: OrderStatus;
    courier: Courier;
    estimatedDelivery: bigint;
    trackingId: string;
    orderId: bigint;
    totalAmount: bigint;
    address: string;
    placedAt: bigint;
    phone: string;
    items: Array<OrderItem>;
    pincode: string;
}
export enum Courier {
    ekart = "ekart",
    delhivery = "delhivery"
}
export enum OrderStatus {
    outForDelivery = "outForDelivery",
    dispatched = "dispatched",
    orderPlaced = "orderPlaced",
    inTransit = "inTransit",
    delivered = "delivered"
}
export interface backendInterface {
    getOrderByTracking(trackingId: string): Promise<OrderField | null>;
    getOrders(): Promise<Array<OrderField>>;
    placeOrder(customerName: string, phone: string, address: string, pincode: string, items: Array<[string, bigint]>, totalAmount: bigint): Promise<string>;
    updateOrderStatus(trackingId: string, status: OrderStatus): Promise<void>;
}
