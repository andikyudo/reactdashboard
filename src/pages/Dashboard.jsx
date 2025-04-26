import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Activity,
	ArrowDown,
	ArrowUp,
	DollarSign,
	Percent,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Sample data for charts
const monthlyData = [
	{ name: "Jan", users: 400, revenue: 2400, amt: 2400 },
	{ name: "Feb", users: 300, revenue: 1398, amt: 2210 },
	{ name: "Mar", users: 200, revenue: 9800, amt: 2290 },
	{ name: "Apr", users: 278, revenue: 3908, amt: 2000 },
	{ name: "May", users: 189, revenue: 4800, amt: 2181 },
	{ name: "Jun", users: 239, revenue: 3800, amt: 2500 },
	{ name: "Jul", users: 349, revenue: 4300, amt: 2100 },
	{ name: "Aug", users: 430, revenue: 4300, amt: 2100 },
	{ name: "Sep", users: 500, revenue: 5300, amt: 2100 },
	{ name: "Oct", users: 470, revenue: 4900, amt: 2100 },
	{ name: "Nov", users: 520, revenue: 6000, amt: 2100 },
	{ name: "Dec", users: 600, revenue: 7000, amt: 2100 },
];

const trafficSourceData = [
	{ name: "Direct", value: 400 },
	{ name: "Organic Search", value: 300 },
	{ name: "Referral", value: 300 },
	{ name: "Social Media", value: 200 },
	{ name: "Email", value: 100 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Dashboard() {
	return (
		<div className='space-y-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>1,254</div>
						<p className='text-xs text-muted-foreground flex items-center'>
							<span className='text-emerald-500 flex items-center mr-1'>
								<ArrowUp className='h-3 w-3 mr-1' />
								12%
							</span>
							from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Revenue</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>$34,567</div>
						<p className='text-xs text-muted-foreground flex items-center'>
							<span className='text-emerald-500 flex items-center mr-1'>
								<ArrowUp className='h-3 w-3 mr-1' />
								8%
							</span>
							from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Conversion Rate
						</CardTitle>
						<Percent className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>3.2%</div>
						<p className='text-xs text-muted-foreground flex items-center'>
							<span className='text-rose-500 flex items-center mr-1'>
								<ArrowDown className='h-3 w-3 mr-1' />
								0.5%
							</span>
							from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Active Sessions
						</CardTitle>
						<Activity className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>267</div>
						<p className='text-xs text-muted-foreground flex items-center'>
							<span className='text-emerald-500 flex items-center mr-1'>
								<ArrowUp className='h-3 w-3 mr-1' />
								24%
							</span>
							from last month
						</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>Monthly Performance</CardTitle>
						<CardDescription>
							View your performance metrics over the past months
						</CardDescription>
					</CardHeader>
					<CardContent className='h-[300px]'>
						<ResponsiveContainer width='100%' height='100%'>
							<AreaChart
								data={monthlyData}
								margin={{
									top: 10,
									right: 30,
									left: 0,
									bottom: 0,
								}}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Legend />
								<Area
									type='monotone'
									dataKey='users'
									stackId='1'
									stroke='#8884d8'
									fill='#8884d8'
								/>
								<Area
									type='monotone'
									dataKey='revenue'
									stackId='1'
									stroke='#82ca9d'
									fill='#82ca9d'
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Traffic Sources</CardTitle>
						<CardDescription>
							Where your visitors are coming from
						</CardDescription>
					</CardHeader>
					<CardContent className='h-[300px]'>
						<ResponsiveContainer width='100%' height='100%'>
							<PieChart>
								<Pie
									data={trafficSourceData}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) =>
										`${name}: ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'
								>
									{trafficSourceData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>User Engagement</CardTitle>
						<CardDescription>Monthly user activity metrics</CardDescription>
					</CardHeader>
					<CardContent className='h-[300px]'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={monthlyData}
								margin={{
									top: 20,
									right: 30,
									left: 20,
									bottom: 5,
								}}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='users' fill='#8884d8' />
								<Bar dataKey='revenue' fill='#82ca9d' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Recent Activities</CardTitle>
						<CardDescription>
							Latest user activities on your platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<div className='grid grid-cols-3 text-sm font-medium text-muted-foreground'>
								<div>User</div>
								<div>Activity</div>
								<div>Time</div>
							</div>
							<div className='grid grid-cols-3 items-center text-sm border-t py-3'>
								<div>John Doe</div>
								<div>Logged in</div>
								<div className='text-muted-foreground'>5 min ago</div>
							</div>
							<div className='grid grid-cols-3 items-center text-sm border-t py-3'>
								<div>Jane Smith</div>
								<div>Updated profile</div>
								<div className='text-muted-foreground'>10 min ago</div>
							</div>
							<div className='grid grid-cols-3 items-center text-sm border-t py-3'>
								<div>Bob Johnson</div>
								<div>Made a purchase</div>
								<div className='text-muted-foreground'>15 min ago</div>
							</div>
							<div className='grid grid-cols-3 items-center text-sm border-t py-3'>
								<div>Alice Brown</div>
								<div>Submitted a ticket</div>
								<div className='text-muted-foreground'>25 min ago</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default Dashboard;
