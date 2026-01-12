import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { productionApi, ProductionAnalytics } from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  TrendingUp, Users, Activity, Calendar, 
  Loader2, Gauge, DollarSign, Target
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface AnalyticsDashboardProps {
  startDate: string;
  endDate: string;
}

export function AnalyticsDashboard({ startDate, endDate }: AnalyticsDashboardProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProductionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await productionApi.getAnalytics(startDate, endDate);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // Don't show error toast - analytics endpoint may not exist yet
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground card-elevated">
        <p>Analytics data not available.</p>
        <p className="text-sm mt-1">The backend may need the /production/analytics endpoint.</p>
      </div>
    );
  }

  const { daily_production, top_performers, loom_utilization, summary } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{summary.total_meters.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Meters</p>
          </div>
        </div>

        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">₹{summary.total_earnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </div>
        </div>

        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-chart-2" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{summary.avg_daily_meters.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Daily Meters</p>
          </div>
        </div>

        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-chart-3" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{summary.active_workers}</p>
            <p className="text-xs text-muted-foreground">Active Workers</p>
          </div>
        </div>

        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{summary.active_looms}</p>
            <p className="text-xs text-muted-foreground">Active Looms</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Production Trend */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Daily Production</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_production} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDailyMeters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  tickLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis fontSize={12} tickLine={false} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} m`, "Meters"]}
                />
                <Area
                  type="monotone"
                  dataKey="meters"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorDailyMeters)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Top Performers</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top_performers.slice(0, 5)}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" fontSize={12} tickLine={false} className="fill-muted-foreground" />
                <YAxis
                  type="category"
                  dataKey="worker_name"
                  fontSize={11}
                  tickLine={false}
                  className="fill-muted-foreground"
                  width={80}
                  tickFormatter={(value) => (value.length > 10 ? `${value.slice(0, 10)}...` : value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} m`, "Total Meters"]}
                />
                <Bar dataKey="total_meters" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Loom Utilization */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Loom Utilization</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loom_utilization.slice(0, 10)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="loom_number"
                fontSize={11}
                tickLine={false}
                className="fill-muted-foreground"
                tickFormatter={(value, index) => {
                  const item = loom_utilization[index];
                  return item ? `${item.shed_name}-${value}` : value;
                }}
              />
              <YAxis fontSize={12} tickLine={false} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.shed_name} - Loom ${data.loom_number}`;
                  }
                  return label;
                }}
                formatter={(value: number, name: string) => [
                  name === "total_meters" ? `${value} m` : value,
                  name === "total_meters" ? "Total Meters" : "Usage Count",
                ]}
              />
              <Legend />
              <Bar dataKey="total_meters" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Meters" />
              <Bar dataKey="usage_count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
