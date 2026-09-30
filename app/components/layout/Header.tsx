"use client";

import Link from "next/link";
import SearchBox from "../ui/SearchBox";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { Suspense, useEffect, useState } from "react";

const menus = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Build PC", href: "/buildpc" },
  { name: "Monitor", href: "/products?category=Monitor" },
  { name: "Gaming Gear", href: "/products?category=Gaming Gear" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {

const [mounted, setMounted] = useState(false);
const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

useEffect(() => {
  setMounted(true);

  const checkCustomer = async () => {
    try {
      const res = await fetch("/api/customer/me", {
        cache: "no-store",
      });

      const data = await res.json();

      setCustomerLoggedIn(
        res.ok && data.success === true && !!data.customer
      );
    } catch {
      setCustomerLoggedIn(false);
    }
  };

  checkCustomer();
}, []);

const totalItems = useCart((state) => state.totalItems());

  return (
  <header className="sticky top-0 z-50 border-b border-red-600 bg-black/95 backdrop-blur">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">

      {/* Main Header */}
      <div className="flex h-20 items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-wider text-red-500 sm:text-3xl lg:text-4xl"
        >
          NEXTCORE
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:block w-72">
          <Suspense
            fallback={
              <div className="h-12 w-72 rounded-xl border border-zinc-700 bg-zinc-900" />
            }
          >
            <SearchBox />
          </Suspense>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="whitespace-nowrap text-white transition duration-300 hover:text-red-500"
            >
              {menu.name}
            </Link>
          ))}

          {mounted && (
            <Link
              href={customerLoggedIn ? "/account" : "/login"}
              className="whitespace-nowrap text-white transition duration-300 hover:text-red-500"
            >
              {customerLoggedIn ? "My Account" : "Login"}
            </Link>
          )}

          <Link href="/cart" className="relative">
            <ShoppingCart
              size={28}
              className="text-white transition hover:text-red-500"
            />

            {mounted && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link href="/cart" className="relative">
            <ShoppingCart size={26} className="text-white" />

            {mounted && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <button
  type="button"
  onClick={() => setMobileMenuOpen((prev) => !prev)}
  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-white"
>
  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 py-4 lg:hidden">

          {/* Mobile Search */}
          <div className="mb-4">
            <Suspense
              fallback={
                <div className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900" />
              }
            >
              <SearchBox />
            </Suspense>
          </div>

          <nav className="flex flex-col">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-zinc-900 py-3 text-white transition hover:text-red-500"
              >
                {menu.name}
              </Link>
            ))}

            {mounted && (
              <Link
                href={customerLoggedIn ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-white transition hover:text-red-500"
              >
                {customerLoggedIn ? "My Account" : "Login"}
              </Link>
            )}
          </nav>
        </div>
      )}

    </div>
  </header>
);
}