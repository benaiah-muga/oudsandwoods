import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Filter } from "lucide-react";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, sortBy, priceRange]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from("products").select("*");

    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }

    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

    if (sortBy === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price-desc") {
      query = query.order("price", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("is_featured", { ascending: false });
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-secondary font-semibold">
              Discover
            </p>
            <h1 className="text-5xl md:text-6xl font-serif font-bold">
              Our Collection
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated selection of luxury fragrances
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block w-full lg:w-64 space-y-6 animate-fade-in`}
            >
              <div className="bg-card p-6 rounded-lg shadow-elegant space-y-6">
                <h3 className="font-serif text-xl font-bold">Filters</h3>

                {/* Category Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange([0, 500]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort & Filter Toggle */}
              <div className="flex justify-between items-center mb-6">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    No products found matching your filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      brand={product.brand || "Ouds & Woods"}
                      price={product.price}
                      originalPrice={product.original_price}
                      imageUrl={product.image_url || product.images?.[0]}
                      rating={4.5}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
