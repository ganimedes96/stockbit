import { LayoutDashboard, Users, BarChart3, Package, TrendingUpDown, UserRoundSearch } from "lucide-react";

const year = new Date().getFullYear();
const month = new Date().getMonth();

export const navItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard />,
    href: "/dashboard",
  },

  {
    title: "Produtos",
    icon: <Package />,
    href: "/products",
  },
  {
    title: "Movimentações",
    icon: <TrendingUpDown /> ,
    href: "/movements",
  },
  {
    title: "Devedores",
    icon: <UserRoundSearch />,
    href: "/debtors",
  },

  {
    title: "Funcionários",
    icon: <Users />,
    href: "/employees",
  },
  {
    title: "Relatórios",
    icon: <BarChart3 />,
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
