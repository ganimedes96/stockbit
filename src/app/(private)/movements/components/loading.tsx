import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[80px] mb-1" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


export function HistoryTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            {[...Array(7)].map((_, index) => (
              <Skeleton key={index} className="h-4 w-[100px] flex-1" />
            ))}
          </div>
          
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 pt-4">
              {[...Array(7)].map((_, cellIndex) => (
                <Skeleton 
                  key={cellIndex} 
                  className="h-4 flex-1" 
                  style={{ 
                    width: cellIndex === 1 ? '150px' : 
                           cellIndex === 5 ? '200px' : '100px' 
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



export function HistoryMovimentsSkeleton() {
  return (
    <div className="flex flex-col mx-6 mb-6">
      {/* Skeleton do seletor de período */}
      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-[200px]" />
      </div>
      
      {/* Skeleton dos cards de resumo */}
      <SummaryCardsSkeleton />
      
      {/* Skeleton da tabela */}
      <HistoryTableSkeleton />
    </div>
  );
}