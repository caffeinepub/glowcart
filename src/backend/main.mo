import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";

actor {
  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
  };

  type OrderStatus = {
    #orderPlaced;
    #dispatched;
    #inTransit;
    #outForDelivery;
    #delivered;
  };

  type Courier = {
    #delhivery;
    #ekart;
  };

  type OrderItem = {
    productId : Text;
    quantity : Nat;
  };

  type OrderField = {
    orderId : Nat;
    trackingId : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    pincode : Text;
    items : [OrderItem];
    totalAmount : Nat;
    status : OrderStatus;
    courier : Courier;
    placedAt : Int;
    estimatedDelivery : Int;
  };

  module OrderField {
    public func compare(order1 : OrderField, order2 : OrderField) : Order.Order {
      Nat.compare(order1.orderId, order2.orderId);
    };
  };

  let orders = Map.empty<Text, OrderField>();
  var orderCounter = 0;

  public query ({ caller }) func getOrderByTracking(trackingId : Text) : async ?OrderField {
    orders.get(trackingId);
  };

  func generateTrackingId() : Text {
    let timestamp = Int.abs(Time.now());
    let uniqueNumber = orderCounter + timestamp;
    "TRACK-" # uniqueNumber.toText();
  };

  func pickRandomCourier() : Courier {
    if (Time.now() % 2 == 0) { #delhivery } else { #ekart };
  };

  public shared ({ caller }) func placeOrder(customerName : Text, phone : Text, address : Text, pincode : Text, items : [(Text, Nat)], totalAmount : Nat) : async Text {
    let trackingId = generateTrackingId();
    let orderId = orderCounter;
    orderCounter += 1;

    let orderItems = items.map(func((prodId, qty)) { { productId = prodId; quantity = qty } });

    let newOrder : OrderField = {
      orderId;
      trackingId;
      customerName;
      phone;
      address;
      pincode;
      items = orderItems;
      totalAmount;
      status = #orderPlaced;
      courier = pickRandomCourier();
      placedAt = Time.now();
      estimatedDelivery = Time.now() + (3 * 24 * 3600 * 1000000000);
    };

    orders.add(trackingId, newOrder);
    trackingId;
  };

  public query ({ caller }) func getOrders() : async [OrderField] {
    orders.values().toArray().sort();
  };

  public shared ({ caller }) func updateOrderStatus(trackingId : Text, status : OrderStatus) : async () {
    switch (orders.get(trackingId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : OrderField = {
          order with
          status;
        };
        orders.add(trackingId, updatedOrder);
      };
    };
  };
};
