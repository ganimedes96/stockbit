"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
  }[];
}

export function Nav({ items }: NavProps) {
  const pathname = usePathname();
  return (
    <div className="w-full flex flex-row items-center justify-start gap-8 p-3">
      {items.map((item) => (
        <div key={item.href} className="flex items-center ">
          <div className="">
            <Link
              prefetch={true}
              href={item.href}
              className={`flex items-center gap-3 flex-row rounded-lg py-2 text-muted-foreground hover:bg-secondary/50 
                      ${
                        pathname === item.href
                          ? " text-yellow-500 font-medium"
                          : ""
                      }`}
            >
              
              <span>{item.title}</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
