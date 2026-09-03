import { Link } from "@tanstack/react-router";
import { Badge, Button, Stars } from "./ui-kit";
import { formatNaira } from "@/utils/format";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const cart = useCart();
  const outOfStock = product.stock === 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link
        to="/store/products/$id"
        params={{ id: String(product.id) }}
        className="block aspect-4/3 bg-muted"
        aria-label={product.name}
      >
        <div className="flex h-full items-center justify-center text-3xl font-bold text-border">
          {product.name.slice(0, 2).toUpperCase()}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
          <Link to="/store/products/$id" params={{ id: String(product.id) }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2">
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatNaira(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatNaira(product.oldPrice)}</span>
          )}
        </div>
        <div className="mt-2">
          {outOfStock ? (
            <Badge tone="danger">Out of stock</Badge>
          ) : product.stock <= 8 ? (
            <Badge tone="warning">Only {product.stock} left</Badge>
          ) : (
            <Badge tone="success">In stock</Badge>
          )}
        </div>
        <Button
          size="sm"
          className="mt-4 w-full"
          disabled={outOfStock}
          onClick={() => cart.addItem(product)}
        >
          {outOfStock ? "Unavailable" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
