import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { CardGridShimmer } from "@/components/Shimmer";
import { fetchWithFallback, formatNaira } from "@/utils/api";
import { mockCart, mockProducts, type CartItem, type Product } from "@/utils/mockData";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — OpenTech Academy Store" },
      {
        name: "description",
        content: "Review the electronics and kits in your OpenTech cart and proceed to checkout.",
      },
      { property: "og:title", content: "Your Cart — OpenTech Academy Store" },
      { property: "og:description", content: "Review your items and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

const SHIPPING = 1500;
const FREE_SHIPPING_AT = 50000;

function CartPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchWithFallback<CartItem[]>("/cart", mockCart),
  });
  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchWithFallback<Product[]>("/products", mockProducts),
  });

  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const setQty = (productId: number, delta: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  const remove = (productId: number) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
  const total = subtotal + (items.length ? SHIPPING : 0);
  const away = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <div className="min-h-screen bg-muted/40">
      <Header tagline="Academy Store" cartCount={count} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>{" "}
          <i className="fa-solid fa-chevron-right text-[8px]" />{" "}
          <Link to="/store" className="hover:text-primary">
            Store
          </Link>{" "}
          <i className="fa-solid fa-chevron-right text-[8px]" /> <span>Cart</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">Your Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your items and proceed to checkout.
            </p>
          </div>
          <Link
            to="/store"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary"
          >
            <i className="fa-solid fa-arrow-left mr-2 text-xs" />
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <div className="rounded-lg border border-border bg-card">
            {isLoading ? (
              <div className="space-y-3 p-4">
                <div className="shimmer h-16 rounded-md" />
                <div className="shimmer h-16 rounded-md" />
                <div className="shimmer h-16 rounded-md" />
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[1fr_100px_160px_60px_100px] border-b border-border px-4 py-3 text-xs font-semibold text-muted-foreground sm:grid">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span />
                  <span>Total</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="grid items-center gap-3 border-b border-border px-4 py-4 sm:grid-cols-[1fr_100px_160px_60px_100px]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-14 w-16 rounded-md border border-border object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        <p className="mt-0.5 text-xs text-emerald-600">
                          <i className="fa-solid fa-circle mr-1 text-[6px] align-middle" />
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold">{formatNaira(item.unitPrice)}</p>

                    <div className="flex w-32 items-center justify-between rounded-md border border-border">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.productId, -1)}
                        className="px-3 py-1.5 text-muted-foreground hover:text-primary"
                      >
                        <i className="fa-solid fa-minus text-xs" />
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.productId, 1)}
                        className="px-3 py-1.5 text-muted-foreground hover:text-primary"
                      >
                        <i className="fa-solid fa-plus text-xs" />
                      </button>
                    </div>

                    <button
                      aria-label={`Remove ${item.name}`}
                      onClick={() => remove(item.productId)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <i className="fa-regular fa-trash-can" />
                    </button>

                    <p className="text-sm font-bold">
                      {formatNaira(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Your cart is empty.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <button
                    onClick={() => setItems([])}
                    className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:border-destructive hover:text-destructive"
                  >
                    <i className="fa-regular fa-trash-can mr-2" />
                    Clear Cart
                  </button>
                  <button className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:border-primary">
                    <i className="fa-solid fa-rotate mr-2" />
                    Update Cart
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({count} items)</span>
                <span className="font-semibold">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">{formatNaira(items.length ? SHIPPING : 0)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-bold">Total</span>
              <span className="text-xl font-extrabold">{formatNaira(total)}</span>
            </div>

            {away > 0 && (
              <div className="mt-4 rounded-md bg-emerald-50 p-3">
                <p className="text-xs text-emerald-800">
                  <i className="fa-solid fa-truck mr-2" />
                  You are <strong>{formatNaira(away)}</strong> away from free shipping!
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100">
                  <div
                    className="h-1.5 rounded-full bg-emerald-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button className="mt-4 w-full rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              Proceed to Checkout <i className="fa-solid fa-arrow-right ml-1 text-xs" />
            </button>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              We accept &nbsp; VISA &nbsp; Mastercard &nbsp; Verve &nbsp; Paystack
            </p>
          </aside>
        </div>

        {/* Suggestions */}
        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">You May Also Like</h2>
            <Link to="/store" className="text-xs font-semibold text-primary">
              View All Products →
            </Link>
          </div>
          <div className="mt-4">
            {loadingSuggestions ? (
              <CardGridShimmer count={5} />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {(suggestions ?? []).slice(6, 11).map((p) => (
                  <ProductCard key={p.id} product={p} detailed />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
