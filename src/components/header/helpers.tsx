import { LayoutDashboard, Users, BarChart3, Package, TrendingUpDown, UserRoundSearch, Store, BookOpenText, MapPin, ClipboardList } from "lucide-react";
import React from "react";

const year = new Date().getFullYear();
const month = new Date().getMonth();

// 1. Criamos tipos mais flexíveis para os itens de navegação
export type SubNavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
};

export type NavItem = {
  title: string;
  icon: React.ReactNode;
  href?: string; // Opcional: para links diretos
  subItems?: SubNavItem[]; // Opcional: para menus colapsáveis
};

// 2. Atualizamos o array navItems com a nova estrutura
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard  className="h-4 w-4"/>,
    href: "/dashboard",
  },
  {
    title: "Catálogo",
    icon: <BookOpenText />,
    subItems: [
      {
        title: "Pedidos",
        href: "/orders",
        icon: <ClipboardList className="h-4 w-4" />
      },
      {
        title: "Bairros",
        href: "/neighborhoods",
        icon: <MapPin className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Produtos",
    icon: <Package />,
    subItems: [
      {
        title: "Lista de Produtos",
        href: "/products",
        icon: <Package className="h-4 w-4" />
      },
      // {
      //   title: "Categorias",
      //   href: "/categories",
      //   icon: <Package className="h-4 w-4" />
      // },
      {
        title: "Movimentações",
        icon: <TrendingUpDown /> ,
        href: "/movements",
      },

      {
        title: "Fornecedores",
        icon: <Store />,
        href: "/supplier",
      },
    ]

  },
  // NOVO ITEM COLAPSÁVEL
  {
    title: "Devedores",
    icon: <UserRoundSearch className="h-4 w-4"/>,
    href: "/debtors",
  },
  {
    title: "Funcionários",
    icon: <Users className="h-4 w-4"/>,
    href: "/employees",
  },
  {
    title: "Relatórios",
    icon: <BarChart3 className="h-4 w-4"/>,
    href: `/reports?year=${year}&month=${month}`,
  },
];

export const access = {
  admin: navItems,
  employee: navItems.filter((item) => item.title === "Products"),
};

export const identifierLinks: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/products": "Produtos",
  "/employees": "Funcionários",
  "/reports": "Relatórios",
  "/profile": "Perfil",
  "/movements": "Movimentações",
  "/debtors": "Devedores",
};
