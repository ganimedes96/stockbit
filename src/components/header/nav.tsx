"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

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
    <ScrollArea className="w-full max-w-full overflow-x-auto">

      <div className="flex w-max flex-row items-center gap-4 px-4 py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            prefetch
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 ${
              pathname === item.href ? "text-yellow-500 font-medium" : ""
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    
  );
}
