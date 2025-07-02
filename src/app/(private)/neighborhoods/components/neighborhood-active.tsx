"use client";

import { Switch } from "@/components/ui/switch";
import { useUpdateNeighborhoodStatus } from "@/domain/neighborhoods/queries";
import { Neighborhood } from "@/domain/neighborhoods/types";

interface NeighborhoodActiveSwitchProps {
  companyId: string;
  neighborhood: Neighborhood;
}

export function NeighborhoodActiveSwitch({
  companyId,
  neighborhood,
}: NeighborhoodActiveSwitchProps) {
  const { mutate, isPending } = useUpdateNeighborhoodStatus(
    companyId,
  );

  const handleStatusChange = () => {
    mutate({neighborhoodId: neighborhood.id, status: !neighborhood.isActive});
  };

  return (
    <Switch
      checked={neighborhood.isActive}
      onCheckedChange={handleStatusChange}
      disabled={isPending}
      aria-label="Toggle service status"
    />
  );
}
