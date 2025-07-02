"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
 // Importe seu tipo NavItem
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// Importa os componentes do DropdownMenu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavItem } from "./helpers";

interface NavProps {
  items: NavItem[];
}

export function Nav({ items }: NavProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="w-full max-w-full">
      {/* Voltamos ao layout original com flex-row */}
      <div className="flex w-max flex-row items-center gap-2 px-4 py-2">
        {items.map((item, index) => (
          // A verificação continua a mesma: o item tem sub-itens?
          item.subItems && item.subItems.length > 0 ? (
            // ===================================================
            // RENDERIZA UM DROPDOWN MENU
            // ===================================================
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2  rounded-lg text-muted-foreground  hover:bg-secondary/50"
                >
                  {item.icon}
                  <span className=" font-medium text-base">{item.title}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.subItems.map((subItem) => (
                  // A prop 'asChild' é importante para que o <Link> funcione corretamente
                  <DropdownMenuItem key={subItem.href} asChild>
                    <Link href={subItem.href} className="flex items-center gap-2">
                      {subItem.icon}
                      <span>{subItem.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // ===================================================
            // RENDERIZA UM LINK NORMAL
            // ===================================================
            <Link
              key={item.href}
              href={item.href || ""}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 ${
                pathname === item.href ? "bg-primary text-primary-foreground font-medium" : ""
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          )
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}