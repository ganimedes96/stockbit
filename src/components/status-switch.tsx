"use client";

import { Switch } from "@/components/ui/switch";
import { ComponentProps } from "react";

type BaseEntity = {
  id: string;
  [key: string]: unknown;
};

interface StatusSwitchProps<T extends BaseEntity> {
  entity: T;
  statusKey?: keyof T;
  mutate: (data: { id: string; status: boolean }) => void;
  isPending?: boolean;
  ariaLabel?: string;
  switchProps?: Partial<ComponentProps<typeof Switch>>;
}

export function StatusSwitch<T extends BaseEntity>({
  entity,
  statusKey = "isActive",
  mutate,
  isPending = false,
  ariaLabel = "Toggle status",
  switchProps,
}: StatusSwitchProps<T>) {
  const statusValue = entity[statusKey] as boolean;

  const handleStatusChange = () => {
    mutate({ id: entity.id, status: !statusValue });
  };

  return (
    <Switch
      checked={statusValue}
      onCheckedChange={handleStatusChange}
      disabled={isPending}
      aria-label={ariaLabel}
      {...switchProps}
    />
  );
}
