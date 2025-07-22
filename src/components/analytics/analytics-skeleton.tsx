import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Productivity Metrics Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Generate 8 card skeletons for metrics */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
                {i === 5 && (
                  <div className="mt-2">
                    <Skeleton className="h-2 w-full mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Productivity Trends Skeleton */}
      <div className="space-y-6">
        {/* First Chart Skeleton - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              {/* X-axis */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Y-axis */}
              <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Chart grid */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-gray-100 dark:border-gray-800"></div>
                ))}
              </div>
              
              {/* Line chart path */}
              <div className="absolute inset-x-0 bottom-10 h-40">
                <div className="relative h-full">
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full h-1/2 bg-gradient-to-t from-transparent to-transparent border-t-2 border-dashed border-blue-300 dark:border-blue-600 opacity-30"></div>
                  </div>
                  
                  {/* Data points */}
                  <div className="absolute inset-0 flex justify-between items-end">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const height = Math.random() * 70 + 10;
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <Skeleton className={`w-3 h-3 rounded-full mb-1`} />
                          <div className={`w-1 bg-blue-400/30 dark:bg-blue-600/30 animate-pulse`} style={{ height: `${height}%` }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-8" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Chart Skeleton - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              {/* X-axis */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Y-axis */}
              <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Chart grid */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-gray-100 dark:border-gray-800"></div>
                ))}
              </div>
              
              {/* Bar chart */}
              <div className="absolute inset-x-0 bottom-10 h-40">
                <div className="relative h-full">
                  {/* Bars */}
                  <div className="absolute inset-0 flex justify-around items-end">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const height1 = Math.random() * 70 + 10;
                      const height2 = Math.random() * 60 + 5;
                      return (
                        <div key={i} className="flex items-end space-x-1">
                          <div className={`w-4 bg-green-400/40 dark:bg-green-600/40 rounded-t animate-pulse`} style={{ height: `${height1}%` }}></div>
                          <div className={`w-4 bg-blue-400/40 dark:bg-blue-600/40 rounded-t animate-pulse`} style={{ height: `${height2}%` }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-8" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Chart Skeleton - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              {/* X-axis */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Y-axis */}
              <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Chart grid */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-gray-100 dark:border-gray-800"></div>
                ))}
              </div>
              
              {/* Bar chart */}
              <div className="absolute inset-x-0 bottom-10 h-40">
                <div className="relative h-full">
                  {/* Bars */}
                  <div className="absolute inset-0 flex justify-around items-end">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const height1 = Math.random() * 80 + 20;
                      const height2 = Math.random() * 70 + 10;
                      return (
                        <div key={i} className="flex items-end space-x-1">
                          <div className={`w-6 bg-blue-400/40 dark:bg-blue-600/40 rounded-t animate-pulse`} style={{ height: `${height1}%` }}></div>
                          <div className={`w-6 bg-green-400/40 dark:bg-green-600/40 rounded-t animate-pulse`} style={{ height: `${height2}%` }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-8" />
                ))}
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center pt-10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}