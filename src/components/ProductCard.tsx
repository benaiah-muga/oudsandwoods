import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
}

const ProductCard = ({
  name,
  brand,
  price,
  originalPrice,
  imageUrl,
  rating = 4.5,
}: ProductCardProps) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </div>
          )}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary hover:bg-secondary/90 text-primary shadow-gold"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {brand}
          </p>
          <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-1">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating)
                    ? "fill-secondary text-secondary"
                    : "text-muted"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({rating})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xl font-bold">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
