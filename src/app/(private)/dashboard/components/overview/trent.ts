import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendStatus = 'up' | 'down' | 'equal';

export const getTrendIcon = (status: TrendStatus) => {
  return {
    up: TrendingUp,
    down: TrendingDown,
    equal: Minus
  }[status];
};

export const getTrendColor = (status: TrendStatus) => {
  return {
    up: 'text-green-500',
    down: 'text-red-500',
    equal: 'text-gray-500'
  }[status];
};

export const formatPercentageChange = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};