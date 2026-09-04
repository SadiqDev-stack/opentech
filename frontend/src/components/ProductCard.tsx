import type { Product } from "@/utils/mockData";
import { formatNaira } from "@/utils/api";

type Props = {
  product: Product;
  /** Show rating row + full "Add to Cart" button (store grid style). */
  detailed?: boolean;
};

export default function ProductCard({ product, detailed = false }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="h-32 w-full rounded-md object-cover"
      />
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold">{product.name}</h3>

      {detailed && (
        <p className="mt-1 text-xs text-muted-foreground">
          <i className="fa-solid fa-star mr-1 text-primary" />
          {product.rating} ({product.ratingCount})
        </p>
      )}

      <p className="mt-1 text-base font-bold">{formatNaira(product.price)}</p>

      <div className="mt-3 flex items-center gap-2">
        {detailed ? (
          <button className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90">
            Add to Cart
          </button>
        ) : (
          <span className="flex-1 text-xs text-muted-foreground">{product.category}</span>
        )}
        <button
          aria-label={`Add ${product.name} to cart`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:border-primary hover:text-primary"
        >
          <i className="fa-solid fa-cart-shopping text-xs" />
        </button>
      </div>
    </div>
  );
}
