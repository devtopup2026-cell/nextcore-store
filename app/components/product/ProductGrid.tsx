import ProductCard from "./ProductCard";
import { Product } from "../../../types/product";

type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}