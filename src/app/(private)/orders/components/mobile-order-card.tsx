"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderStatus } from "@/domain/orders/types";
import { formatCurrency } from "@/utils/text/format";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { orderStatusMap } from "./orders-list"; // Importe seu mapa de status

interface MobileOrderCardProps {
  order: Order;
  onStatusChange: (order: Order, newStatus: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  isPending: boolean;
}

export function MobileOrderCard({ order, onStatusChange, onViewDetails, isPending }: MobileOrderCardProps) {
  const statusInfo = orderStatusMap[order.status] || { 
    label: 'Desconhecido', 
    color: 'bg-gray-100 text-gray-800', 
    icon: () => null 
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
          <Badge variant="outline" className={`font-semibold ${statusInfo.color}`}>
            <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <span>Data</span>
          <span>{format(order.createdAt, "dd/MM/yyyy")}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(order)}>
          <Eye className="h-4 w-4 mr-2" />
          Detalhes
        </Button>
        <Select
          value={order.status}
          onValueChange={(newStatus) => onStatusChange(order, newStatus as OrderStatus)}
          disabled={isPending}
        >
          <SelectTrigger className="flex-1 h-9">
            <SelectValue placeholder="Alterar status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(orderStatusMap).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}