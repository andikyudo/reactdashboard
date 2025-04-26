import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Sample data for charts
const dailyTrafficData = [
  { date: '2023-01-01', users: 4000, pageviews: 2400, sessions: 2400 },
  { date: '2023-01-02', users: 3000, pageviews: 1398, sessions: 2210 },
  { date: '2023-01-03', users: 2000, pageviews: 9800, sessions: 2290 },
  { date: '2023-01-04', users: 2780, pageviews: 3908, sessions: 2000 },
  { date: '2023-01-05', users: 1890, pageviews: 4800, sessions: 2181 },
  { date: '2023-01-06', users: 2390, pageviews: 3800, sessions: 2500 },
  { date: '2023-01-07', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-08', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-09', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-10', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-11', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-12', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-13', users: 3490, pageviews: 4300, sessions: 2100 },
  { date: '2023-01-14', users: 3490, pageviews: 4300, sessions: 2100 },
];

const trafficSourceData = [
  { name: 'Direct', value: 400 },
  { name: 'Organic Search', value: 300 },
  { name: 'Referral', value: 300 },
  { name: 'Social Media', value: 200 },
  { name: 'Email', value: 100 },
];

const engagementData = [
  { name: 'Page 1', views: 4000, avgTime: 240 },
  { name: 'Page 2', views: 3000, avgTime: 139 },
  { name: 'Page 3', views: 2000, avgTime: 980 },
  { name: 'Page 4', views: 2780, avgTime: 390 },
  { name: 'Page 5', views: 1890, avgTime: 480 },
];

const funnelData = [
  { name: 'Visitors', value: 5000 },
  { name: 'Product Views', value: 3500 },
  { name: 'Add to Cart', value: 2200 },
  { name: 'Checkout', value: 1500 },
  { name: 'Purchase', value: 1000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Analytics() {
  const [dateRange, setDateRange] = useState('last30days');
  const [metric, setMetric] = useState('users');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label htmlFor="date-range" className="text-sm font-medium">Date Range:</label>
              <select 
                id="date-range" 
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="metrics" className="text-sm font-medium">Metrics:</label>
              <select 
                id="metrics" 
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="users">Users</option>
                <option value="sessions">Sessions</option>
                <option value="pageviews">Pageviews</option>
                <option value="conversions">Conversions</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            
            <Button>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,589</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-emerald-500 mr-1">+15.7%</span>
              from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56,892</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-emerald-500 mr-1">+12.3%</span>
              from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 42s</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-emerald-500 mr-1">+0.8%</span>
              from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.3%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-rose-500 mr-1">+2.1%</span>
              from previous period
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Traffic</CardTitle>
            <CardDescription>Daily user traffic over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyTrafficData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="pageviews" stroke="#82ca9d" />
                <Line type="monotone" dataKey="sessions" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Page views and average time on page</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Page Views" />
                <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg. Time (sec)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from visit to purchase</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={funnelData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
