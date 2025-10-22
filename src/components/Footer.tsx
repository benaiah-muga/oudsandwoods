import { Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold">Ouds & Woods</h3>
            <p className="text-sm text-primary-foreground/80">
              Luxury fragrances crafted with passion and precision for the modern connoisseur.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/shop" className="hover:text-secondary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-secondary transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-secondary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/sale" className="hover:text-secondary transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Information</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/about" className="hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-secondary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-secondary transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Account</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/auth" className="hover:text-secondary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-secondary transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-secondary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-secondary transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2025 Ouds & Woods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
