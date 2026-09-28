"use client";

import Link from "next/link";
import SearchBox from "../ui/SearchBox";
import { ShoppingCart } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-red-600">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-4xl font-black tracking-wider text-red-500"
        >
          NEXTCORE
        </Link>

        <div className="hidden lg:block w-72">
  <Suspense
    fallback={
      <div className="h-12 w-80 rounded-xl border border-zinc-700 bg-zinc-900" />
    }
  >
    <SearchBox />
  </Suspense>
</div>

<nav className="flex items-center gap-8">

  {menus.map((menu) => (
    <Link
      key={menu.href}
      href={menu.href}
      className="text-white hover:text-red-500 transition duration-300"
    >
      {menu.name}
    </Link>
  ))}


{mounted && (
  <Link
    href={customerLoggedIn ? "/account" : "/login"}
    className="text-white hover:text-red-500 transition duration-300"
  >
    {customerLoggedIn ? "My Account" : "Login"}
  </Link>
)}


<Link
    href="/cart"
    className="relative"
  >
<ShoppingCart
      size={28}
      className="text-white hover:text-red-500"
      />

      {mounted && totalItems > 0 && (
    <span
        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
      >
        {totalItems}
      </span>
    )}
  </Link>

</nav>

      </div>

    </header>
  );
}