import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercentageChange, getTrendColor, getTrendIcon } from "./trent";

export const MetricWithComparison = ({
  title,
  value,
  comparison,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  comparison?: {
    status: "up" | "down" | "equal";
    percentageChange: number;
  };
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) => {
  const TrendIcon = comparison ? getTrendIcon(comparison.status) : null;
  const trendColor = comparison ? getTrendColor(comparison.status) : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-3xl font-bold">{value}</div>
        {comparison ? (
          <div className="">
            <div className="text-xs text-muted-foreground flex items-center">
              {TrendIcon && (
                <TrendIcon className={`mr-1 h-4 w-4 ${trendColor}`} />
              )}
              <span className={trendColor}>
                {formatPercentageChange(comparison.percentageChange)}
              </span>{" "}
            </div>
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sem comparação com o dia anterior{" "}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
