"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function Links() {
  const pathname = usePathname();
  const isDisabled = false; // Example condition
  return (
    <>
      <nav className="p-4 space-x-5 ">
        <Link
          href="/"
          className={`p-3 border-4 border-neutral-600 bg-clip-padding rounded-md transition-all duration-300 ease-out  ${
            pathname === "/" ? "bg-neutral-300 " : "bg-neutral-600"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Home
        </Link>
        <Link
          href="/inventory"
          className={`p-3 border-4 border-neutral-600 bg-clip-padding rounded-md transition-all duration-300 ease-out  ${
            pathname === "/inventory" ? "bg-neutral-300" : "bg-neutral-600"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Inventory
        </Link>
      </nav>
    </>
  );
}
