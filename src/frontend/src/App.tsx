import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { OrderField } from "./backend.d";
import {
  useGetOrderByTracking,
  useGetOrders,
  usePlaceOrder,
} from "./hooks/useQueries";

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: "p1",
    name: "Glossified Lip Plumper - K-Pop 04",
    desc: "Deep rich black cherry colour, Made in Korea",
    price: 10,
    image:
      "/assets/uploads/20260329140427-019d38d4-409e-7076-932b-a02f610f0eca-1.jpg",
    rating: 4.7,
  },
  {
    id: "p2",
    name: "Staze Olo Y.U.M.M.Y Lip Gloss Balm - Strawberry Jelly",
    desc: "Glossy strawberry jelly lip gloss balm",
    price: 15,
    image:
      "/assets/uploads/20260329141546-019d38df-99c0-74c8-942d-26004f22d7cd-1.jpg",
    rating: 4.5,
  },
  {
    id: "p3",
    name: "Typsy Beauty Pout Polish - Strawberry Cheesecake",
    desc: "Lip mousse with Peptide + Collagen, sold every minute",
    price: 20,
    image:
      "/assets/uploads/20260329141324-019d38d4-416f-7368-b413-01e56b2074c6-3.jpg",
    rating: 4.6,
  },
  {
    id: "p4",
    name: "Typsy Beauty Lip Gloss - Polar Pink 03",
    desc: "High-shine polar pink, Made in Korea",
    price: 25,
    image:
      "/assets/uploads/20260329140646-019d38d4-41b2-7040-9507-fb9b85eede68-4.jpg",
    rating: 4.7,
  },
  {
    id: "p5",
    name: "Typsy Beauty Pout Cloud Matte Lip Balm - Cherry Whip",
    desc: "Playful cherry rose matte balm with Peptide + Ceramide",
    price: 35,
    image:
      "/assets/uploads/20260329141247-019d38d4-43e8-75db-869d-a0f20b52e209-5.jpg",
    rating: 4.8,
  },
  {
    id: "p6",
    name: "Lip Plumper - Cherry Blossom 01",
    desc: "Blush pink with fine champagne sparkles, Made in Korea",
    price: 40,
    image:
      "/assets/uploads/20260329140357-019d38d4-43b1-706e-b521-8cbc03a264ce-6.jpg",
    rating: 4.7,
  },
];

const ORDER_STEPS = [
  { key: "orderPlaced", label: "Order Placed", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "inTransit", label: "In Transit", icon: MapPin },
  { key: "outForDelivery", label: "Out for Delivery", icon: Clock },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

type CartItem = { productId: string; quantity: number };

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function getStepIndex(status: string) {
  const map: Record<string, number> = {
    orderPlaced: 0,
    dispatched: 1,
    inTransit: 2,
    outForDelivery: 3,
    delivered: 4,
  };
  return map[status] ?? 0;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: string) {
  const map: Record<string, string> = {
    orderPlaced: "status-badge-placed",
    dispatched: "status-badge-dispatched",
    inTransit: "status-badge-transit",
    outForDelivery: "status-badge-out",
    delivered: "status-badge-delivered",
  };
  return map[status] ?? "status-badge-placed";
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    orderPlaced: "Order Placed",
    dispatched: "Dispatched",
    inTransit: "In Transit",
    outForDelivery: "Out for Delivery",
    delivered: "Delivered",
  };
  return map[status] ?? status;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= Math.floor(rating)
              ? "fill-rose-gold text-rose-gold"
              : i - 0.5 <= rating
                ? "fill-rose-gold/50 text-rose-gold"
                : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hero 3D Float Scene (pure CSS)
// ──────────────────────────────────────────────────────────────────────────────

function FloatingProducts() {
  const floatClasses = [
    "float-1",
    "float-2",
    "float-3",
    "float-4",
    "float-5",
    "float-6",
  ];
  const positions = [
    { top: "5%", left: "10%", width: 120, rotate: "-8deg", zIndex: 3 },
    { top: "10%", left: "55%", width: 100, rotate: "6deg", zIndex: 2 },
    { top: "35%", left: "5%", width: 130, rotate: "-4deg", zIndex: 4 },
    { top: "30%", left: "62%", width: 110, rotate: "10deg", zIndex: 2 },
    { top: "62%", left: "20%", width: 115, rotate: "3deg", zIndex: 3 },
    { top: "58%", left: "58%", width: 125, rotate: "-6deg", zIndex: 3 },
  ];
  return (
    <div className="relative w-full h-full" style={{ perspective: "900px" }}>
      {/* Glow blobs */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.30 0.09 10 / 0.6) 0%, oklch(0.18 0.07 10 / 0.3) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {PRODUCTS.map((p, i) => (
        <div
          key={p.id}
          className={`absolute ${floatClasses[i]}`}
          style={{
            top: positions[i].top,
            left: positions[i].left,
            width: positions[i].width,
            zIndex: positions[i].zIndex,
            transform: `rotate(${positions[i].rotate})`,
            filter: "drop-shadow(0 8px 24px oklch(0.30 0.09 10 / 0.8))",
          }}
        >
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid oklch(0.63 0.10 5 / 0.4)",
              boxShadow:
                "0 4px 24px oklch(0.63 0.10 5 / 0.25), inset 0 1px 0 oklch(0.96 0.002 0 / 0.1)",
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Track Order Timeline
// ──────────────────────────────────────────────────────────────────────────────

function OrderTimeline({ order }: { order: OrderField }) {
  const currentStep = getStepIndex(order.status);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 rounded-xl"
      style={{
        background: "oklch(0.22 0.006 270)",
        border: "1px solid oklch(0.32 0.06 5 / 0.4)",
      }}
    >
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">
          Order:{" "}
          <span className="text-foreground font-medium">
            #{String(order.orderId)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Courier:{" "}
          <span className="text-rose-gold font-semibold uppercase">
            {order.courier}
          </span>
        </span>
        <span className="text-muted-foreground">
          Est. Delivery:{" "}
          <span className="text-foreground font-medium">
            {formatDate(order.estimatedDelivery)}
          </span>
        </span>
      </div>

      {/* Timeline */}
      <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-2">
        {/* Connector line */}
        <div
          className="absolute top-5 left-0 right-0 h-0.5"
          style={{ background: "oklch(0.35 0.006 270)" }}
        >
          <div
            className="h-full transition-all duration-700"
            style={{
              background:
                "linear-gradient(to right, oklch(0.63 0.10 5), oklch(0.60 0.09 5))",
              width: `${(currentStep / 4) * 100}%`,
            }}
          />
        </div>

        {ORDER_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentStep;
          const isActive = idx === currentStep;
          return (
            <div
              key={step.key}
              className="relative flex flex-col items-center gap-2 min-w-[80px] flex-1"
            >
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
                  isActive ? "pulse-node" : ""
                }`}
                style={{
                  background: isDone
                    ? "oklch(0.63 0.10 5)"
                    : "oklch(0.22 0.006 270)",
                  borderColor: isDone
                    ? "oklch(0.63 0.10 5)"
                    : "oklch(0.45 0.006 270)",
                }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: isDone ? "#fff" : "oklch(0.45 0.006 270)" }}
                />
              </div>
              <span
                className="text-xs text-center leading-tight"
                style={{
                  color: isDone
                    ? "oklch(0.66 0.09 5)"
                    : "oklch(0.45 0.006 270)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main App
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackInput, setTrackInput] = useState("");
  const [activeTrackId, setActiveTrackId] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{
    trackingId: string;
  } | null>(null);

  // Checkout form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });

  const { data: orders = [], isLoading: ordersLoading } = useGetOrders();
  const { data: trackedOrder, isLoading: trackLoading } =
    useGetOrderByTracking(activeTrackId);
  const placeMutation = usePlaceOrder();

  const productsRef = useRef<HTMLElement>(null);
  const ordersRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.productId);
    return s + (p?.price ?? 0) * i.quantity;
  }, 0);

  function addToCart(productId: string) {
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === productId);
      if (ex)
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { productId, quantity: 1 }];
    });
    toast.success("Added to cart!", { duration: 1500 });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handlePlaceOrder() {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error("Please fill all fields");
      return;
    }
    const items: [string, bigint][] = cart.map((i) => [
      i.productId,
      BigInt(i.quantity),
    ]);
    try {
      const trackingId = await placeMutation.mutateAsync({
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        items,
        totalAmount: BigInt(cartTotal),
      });
      setOrderSuccess({ trackingId });
      setCart([]);
      setForm({ name: "", phone: "", address: "", pincode: "" });
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" theme="dark" />

      {/* ── HEADER ── */}
      <header className="glass-header sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-gold" />
            <span className="font-display text-xl font-bold tracking-widest text-rose-gold">
              GLOWCART
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Shop", action: () => scrollTo(productsRef) },
              { label: "New Arrivals", action: () => scrollTo(productsRef) },
              { label: "Bestsellers", action: () => scrollTo(productsRef) },
              { label: "My Orders", action: () => scrollTo(ordersRef) },
              { label: "Track Order", action: () => scrollTo(trackRef) },
            ].map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={item.action}
                data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "-").replace("'", "")}.link`}
                className="text-sm tracking-wider uppercase text-muted-foreground hover:text-rose-gold transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            data-ocid="cart.open_modal_button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-accent/20 transition-colors"
          >
            <ShoppingBag className="h-6 w-6 text-muted-foreground hover:text-rose-gold transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-rose-gold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-8 items-center py-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 z-10"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
              style={{
                background: "oklch(0.30 0.09 10 / 0.4)",
                border: "1px solid oklch(0.63 0.10 5 / 0.4)",
                color: "oklch(0.66 0.09 5)",
              }}
            >
              <Sparkles className="h-3 w-3" />
              New Collection 2026
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-none tracking-tight uppercase">
              <span className="block text-off-white">LUXE</span>
              <span
                className="block"
                style={{
                  color: "oklch(0.63 0.10 5)",
                  WebkitTextStroke: "1px oklch(0.63 0.10 5 / 0.5)",
                }}
              >
                LIPS
              </span>
              <span className="block text-off-white">AWAIT</span>
            </h1>

            <p
              className="text-base leading-relaxed max-w-md"
              style={{ color: "oklch(0.77 0.006 270)" }}
            >
              Discover our premium K-Beauty lip collection — plumpers, glosses,
              and balms curated for the modern woman. Luxurious formulas,
              delivered to your door in 4–7 days.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                data-ocid="hero.primary_button"
                onClick={() => scrollTo(productsRef)}
                size="lg"
                className="uppercase tracking-widest font-semibold px-8 hover:scale-105 transition-transform"
                style={{
                  background: "oklch(0.63 0.10 5)",
                  color: "oklch(0.17 0.005 270)",
                }}
              >
                SHOP LIPS NOW
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                data-ocid="hero.secondary_button"
                onClick={() => scrollTo(trackRef)}
                variant="outline"
                size="lg"
                className="uppercase tracking-widest font-semibold px-8 hover:scale-105 transition-transform"
                style={{
                  borderColor: "oklch(0.63 0.10 5 / 0.6)",
                  color: "oklch(0.63 0.10 5)",
                }}
              >
                Track Order
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              {[
                ["6", "Premium", "Formulas"],
                ["4-7", "Day", "Delivery"],
                ["₹10", "Starting", "Price"],
              ].map(([num, line1, line2]) => (
                <div key={num} className="text-center">
                  <div
                    className="font-display text-2xl font-bold"
                    style={{ color: "oklch(0.63 0.10 5)" }}
                  >
                    {num}
                  </div>
                  <div
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "oklch(0.77 0.006 270)" }}
                  >
                    {line1}
                    <br />
                    {line2}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - 3D floating products */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px] hidden lg:block"
          >
            <FloatingProducts />
          </motion.div>
        </div>

        {/* Decorative bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.17 0.005 270))",
          }}
        />
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section
        ref={productsRef as React.RefObject<HTMLElement>}
        id="products"
        className="py-20 max-w-7xl mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-3"
            style={{ color: "oklch(0.63 0.10 5)" }}
          >
            Our Collection
          </p>
          <h2 className="font-display text-4xl font-bold uppercase tracking-wider">
            FEATURED LUXE LIPS
          </h2>
          <div
            className="mt-4 mx-auto w-24 h-0.5"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.63 0.10 5), transparent)",
            }}
          />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              data-ocid={`products.item.${i + 1}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="product-card rounded-xl overflow-hidden group"
            >
              {/* Image */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-wine/20 to-burgundy/30"
                style={{ height: 240 }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-bg/60 via-transparent to-transparent" />
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "oklch(0.63 0.10 5)",
                    color: "oklch(0.17 0.005 270)",
                  }}
                >
                  ₹{product.price}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: "oklch(0.77 0.006 270)" }}
                >
                  {product.desc}
                </p>
                <StarRating rating={product.rating} />

                <div className="flex items-center justify-between pt-1">
                  <span className="font-display text-xl font-bold text-rose-gold">
                    ₹{product.price}
                  </span>
                  <Button
                    data-ocid={`products.add_to_cart.${i + 1}`}
                    size="sm"
                    onClick={() => addToCart(product.id)}
                    className="text-xs uppercase tracking-wider font-semibold hover:scale-105 transition-all"
                    style={{
                      background: "oklch(0.63 0.10 5)",
                      color: "oklch(0.17 0.005 270)",
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MY ORDERS ── */}
      <section
        ref={ordersRef as React.RefObject<HTMLElement>}
        id="orders"
        className="py-20"
        style={{ background: "oklch(0.19 0.006 270)" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: "oklch(0.63 0.10 5)" }}
            >
              Confirmed
            </p>
            <h2 className="font-display text-4xl font-bold uppercase tracking-wider">
              MY ORDERS
            </h2>
            <div
              className="mt-4 mx-auto w-24 h-0.5"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(0.63 0.10 5), transparent)",
              }}
            />
          </motion.div>

          {ordersLoading ? (
            <div
              data-ocid="orders.loading_state"
              className="flex justify-center py-20"
            >
              <div className="w-8 h-8 rounded-full border-2 border-rose-gold border-t-transparent animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div data-ocid="orders.empty_state" className="text-center py-20">
              <Package
                className="mx-auto h-12 w-12 mb-4"
                style={{ color: "oklch(0.45 0.006 270)" }}
              />
              <p className="text-muted-foreground">
                No orders yet. Start shopping!
              </p>
              <Button
                onClick={() => scrollTo(productsRef)}
                className="mt-4"
                style={{
                  background: "oklch(0.63 0.10 5)",
                  color: "oklch(0.17 0.005 270)",
                }}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div
              className="overflow-x-auto rounded-xl"
              style={{ border: "1px solid oklch(0.32 0.06 5 / 0.3)" }}
            >
              <table data-ocid="orders.table" className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "oklch(0.25 0.06 5 / 0.3)",
                      borderBottom: "1px solid oklch(0.32 0.06 5 / 0.4)",
                    }}
                  >
                    {[
                      "Order ID",
                      "Items",
                      "Total",
                      "Tracking ID",
                      "Courier",
                      "Est. Delivery",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "oklch(0.63 0.10 5)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={String(order.orderId)}
                      data-ocid={`orders.row.${i + 1}`}
                      className="border-b transition-colors hover:bg-accent/5"
                      style={{ borderColor: "oklch(0.32 0.06 5 / 0.2)" }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{String(order.orderId)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {order.items.map((item) => {
                            const p = PRODUCTS.find(
                              (x) => x.id === item.productId,
                            );
                            return (
                              <span key={item.productId} className="text-xs">
                                {p?.name ?? item.productId} ×{" "}
                                {String(item.quantity)}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-rose-gold">
                        ₹{String(order.totalAmount)}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-xs"
                        style={{ color: "oklch(0.63 0.10 5)" }}
                      >
                        {order.trackingId}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="uppercase text-xs font-bold"
                          style={{ color: "oklch(0.66 0.09 5)" }}
                        >
                          {order.courier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(order.estimatedDelivery)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── TRACK ORDER ── */}
      <section
        ref={trackRef as React.RefObject<HTMLElement>}
        id="track"
        className="py-20 max-w-7xl mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-3"
            style={{ color: "oklch(0.63 0.10 5)" }}
          >
            Live Updates
          </p>
          <h2 className="font-display text-4xl font-bold uppercase tracking-wider">
            TRACK YOUR ORDER
          </h2>
          <div
            className="mt-4 mx-auto w-24 h-0.5"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.63 0.10 5), transparent)",
            }}
          />
        </motion.div>

        <div className="max-w-xl mx-auto">
          <div className="flex gap-3">
            <Input
              data-ocid="track.search_input"
              placeholder="Enter your Tracking ID..."
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && setActiveTrackId(trackInput.trim())
              }
              className="flex-1 bg-input text-foreground placeholder:text-muted-foreground border-border focus:border-rose-gold"
            />
            <Button
              data-ocid="track.primary_button"
              onClick={() => setActiveTrackId(trackInput.trim())}
              disabled={!trackInput.trim()}
              className="uppercase tracking-wider"
              style={{
                background: "oklch(0.63 0.10 5)",
                color: "oklch(0.17 0.005 270)",
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              TRACK
            </Button>
          </div>

          {trackLoading && activeTrackId && (
            <div
              data-ocid="track.loading_state"
              className="flex justify-center py-12"
            >
              <div className="w-8 h-8 rounded-full border-2 border-rose-gold border-t-transparent animate-spin" />
            </div>
          )}

          {!trackLoading && activeTrackId && trackedOrder === null && (
            <div data-ocid="track.error_state" className="text-center py-12">
              <p className="text-muted-foreground">
                No order found with tracking ID:{" "}
                <span className="text-rose-gold font-mono">
                  {activeTrackId}
                </span>
              </p>
            </div>
          )}

          {trackedOrder && <OrderTimeline order={trackedOrder} />}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="border-t py-12"
        style={{
          borderColor: "oklch(0.32 0.06 5 / 0.3)",
          background: "oklch(0.15 0.005 270)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-gold" />
            <span className="font-display text-lg font-bold tracking-widest text-rose-gold">
              GLOWCART
            </span>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.45 0.006 270)" }}>
            Premium K-Beauty Lip Collection · Free Delivery on all orders
          </p>
          <div
            className="flex justify-center gap-6 text-xs"
            style={{ color: "oklch(0.55 0.006 270)" }}
          >
            {[
              "Privacy Policy",
              "Terms of Service",
              "Contact Us",
              "Returns",
            ].map((link) => (
              <span
                key={link}
                className="hover:text-rose-gold cursor-pointer transition-colors"
              >
                {link}
              </span>
            ))}
          </div>
          <Separator className="my-4 opacity-20" />
          <p className="text-xs" style={{ color: "oklch(0.45 0.006 270)" }}>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-rose-gold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* ── CART DRAWER ── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          data-ocid="cart.sheet"
          className="w-full sm:max-w-md flex flex-col"
          style={{
            background: "oklch(0.20 0.006 270)",
            borderLeft: "1px solid oklch(0.32 0.06 5 / 0.4)",
          }}
        >
          <SheetHeader>
            <SheetTitle
              className="font-display text-xl tracking-widest"
              style={{ color: "oklch(0.63 0.10 5)" }}
            >
              YOUR BAG
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 mt-4 scrollbar-thin">
            {cart.length === 0 ? (
              <div
                data-ocid="cart.empty_state"
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <ShoppingBag
                  className="h-12 w-12"
                  style={{ color: "oklch(0.45 0.006 270)" }}
                />
                <p className="text-muted-foreground text-sm">
                  Your bag is empty
                </p>
                <Button
                  onClick={() => {
                    setCartOpen(false);
                    scrollTo(productsRef);
                  }}
                  size="sm"
                  style={{
                    background: "oklch(0.63 0.10 5)",
                    color: "oklch(0.17 0.005 270)",
                  }}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pr-2">
                {cart.map((item, i) => {
                  const p = PRODUCTS.find((x) => x.id === item.productId)!;
                  return (
                    <div
                      key={item.productId}
                      data-ocid={`cart.item.${i + 1}`}
                      className="flex gap-3 p-3 rounded-lg"
                      style={{
                        background: "oklch(0.22 0.006 270)",
                        border: "1px solid oklch(0.32 0.06 5 / 0.3)",
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2 leading-tight">
                          {p.name}
                        </p>
                        <p className="text-rose-gold font-bold text-sm mt-1">
                          ₹{p.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            data-ocid={`cart.minus.${i + 1}`}
                            onClick={() => updateQty(item.productId, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-accent/20 transition-colors"
                            style={{
                              border: "1px solid oklch(0.45 0.006 270)",
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            data-ocid={`cart.plus.${i + 1}`}
                            onClick={() => updateQty(item.productId, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-accent/20 transition-colors"
                            style={{
                              border: "1px solid oklch(0.45 0.006 270)",
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        data-ocid={`cart.delete_button.${i + 1}`}
                        onClick={() => removeFromCart(item.productId)}
                        className="self-start p-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {cart.length > 0 && (
            <div
              className="pt-4 border-t space-y-4"
              style={{ borderColor: "oklch(0.32 0.06 5 / 0.3)" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground uppercase text-xs tracking-wider">
                  Total
                </span>
                <span className="font-display text-2xl font-bold text-rose-gold">
                  ₹{cartTotal}
                </span>
              </div>
              <Button
                data-ocid="cart.primary_button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="w-full uppercase tracking-widest font-semibold"
                style={{
                  background: "oklch(0.63 0.10 5)",
                  color: "oklch(0.17 0.005 270)",
                }}
              >
                Checkout
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── CHECKOUT MODAL ── */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent
          data-ocid="checkout.dialog"
          className="sm:max-w-md"
          style={{
            background: "oklch(0.20 0.006 270)",
            border: "1px solid oklch(0.32 0.06 5 / 0.4)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-display text-xl tracking-widest"
              style={{ color: "oklch(0.63 0.10 5)" }}
            >
              {orderSuccess ? "ORDER CONFIRMED!" : "CHECKOUT"}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {orderSuccess ? (
              <motion.div
                key="success"
                data-ocid="checkout.success_state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-4"
              >
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.30 0.09 10 / 0.4)",
                    border: "2px solid oklch(0.63 0.10 5)",
                  }}
                >
                  <CheckCircle className="h-8 w-8 text-rose-gold" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your order has been placed successfully!
                </p>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: "oklch(0.22 0.006 270)",
                    border: "1px solid oklch(0.63 0.10 5 / 0.3)",
                  }}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Your Tracking ID
                  </p>
                  <p className="font-mono text-lg font-bold text-rose-gold">
                    {orderSuccess.trackingId}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected delivery in 4-7 business days via Delhivery or Ekart
                </p>
                <Button
                  data-ocid="checkout.close_button"
                  onClick={() => {
                    setCheckoutOpen(false);
                    setOrderSuccess(null);
                    scrollTo(ordersRef);
                  }}
                  className="w-full uppercase tracking-wider"
                  style={{
                    background: "oklch(0.63 0.10 5)",
                    color: "oklch(0.17 0.005 270)",
                  }}
                >
                  View My Orders
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    data-ocid="checkout.name.input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    data-ocid="checkout.phone.input"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Delivery Address
                  </Label>
                  <Input
                    id="address"
                    data-ocid="checkout.address.input"
                    placeholder="House no., Street, City, State"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pincode"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    data-ocid="checkout.pincode.input"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <Separator style={{ background: "oklch(0.32 0.06 5 / 0.3)" }} />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Order Total
                  </span>
                  <span className="font-display text-xl font-bold text-rose-gold">
                    ₹{cartTotal}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    data-ocid="checkout.cancel_button"
                    variant="outline"
                    onClick={() => setCheckoutOpen(false)}
                    className="flex-1"
                    style={{
                      borderColor: "oklch(0.45 0.006 270)",
                      color: "oklch(0.77 0.006 270)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="checkout.submit_button"
                    onClick={handlePlaceOrder}
                    disabled={placeMutation.isPending}
                    className="flex-1 uppercase tracking-wider font-semibold"
                    style={{
                      background: "oklch(0.63 0.10 5)",
                      color: "oklch(0.17 0.005 270)",
                    }}
                  >
                    {placeMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />{" "}
                        Placing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
