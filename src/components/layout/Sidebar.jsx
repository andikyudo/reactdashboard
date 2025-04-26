import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Calendar,
	FileText,
	Globe,
	HelpCircle,
	Home,
	LayoutDashboard,
	LogOut,
	MessageSquare,
	PieChart,
	Settings,
	Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const mainNavItems = [
	{
		title: "Home",
		href: "/",
		icon: Home,
	},
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Analytics",
		href: "/analytics",
		icon: BarChart3,
	},
	{
		title: "Reports",
		href: "/reports",
		icon: FileText,
	},
	{
		title: "Users",
		href: "/users",
		icon: Users,
	},
	{
		title: "Statistics",
		href: "/statistics",
		icon: PieChart,
	},
	{
		title: "Map",
		href: "/map",
		icon: Globe,
	},
	{
		title: "Calendar",
		href: "/calendar",
		icon: Calendar,
	},
	{
		title: "Messages",
		href: "/messages",
		icon: MessageSquare,
	},
];

const bottomNavItems = [
	{
		title: "Settings",
		href: "/settings",
		icon: Settings,
	},
	{
		title: "Help",
		href: "/help",
		icon: HelpCircle,
	},
];

export function Sidebar({ className, isCollapsed = false }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className={cn("pb-12 h-full flex flex-col", className)}>
			<div className='flex flex-col flex-1'>
				{!isCollapsed && (
					<div className='px-4 py-4'>
						<h2 className='mb-2 px-2 text-xl font-semibold tracking-tight'>
							Reach Dashboard
						</h2>
					</div>
				)}

				{isCollapsed && (
					<div className='py-4 flex justify-center'>
						<span className='h-10 w-10 flex items-center justify-center rounded-md bg-primary text-white font-bold text-xl'>
							R
						</span>
					</div>
				)}

				<ScrollArea className='flex-1 px-4'>
					<div className='space-y-1 py-2'>
						{mainNavItems.map((item) => (
							<NavItem
								key={item.href}
								item={item}
								isActive={location.pathname === item.href}
								isCollapsed={isCollapsed}
							/>
						))}
					</div>
				</ScrollArea>

				<div className='mt-auto px-4 py-2'>
					<div className='space-y-1'>
						{bottomNavItems.map((item) => (
							<NavItem
								key={item.href}
								item={item}
								isActive={location.pathname === item.href}
								isCollapsed={isCollapsed}
							/>
						))}

						{/* Logout Button */}
						{isCollapsed ? (
							<TooltipProvider>
								<Tooltip delayDuration={0}>
									<TooltipTrigger asChild>
										<Button
											variant='ghost'
											size='icon'
											className='w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
											onClick={handleLogout}
										>
											<LogOut className='h-5 w-5' />
											<span className='sr-only'>Log out</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent side='right' className='font-medium'>
										Log out
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<Button
								variant='ghost'
								size='sm'
								className='w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
								onClick={handleLogout}
							>
								<LogOut className='mr-2 h-4 w-4' />
								Log out
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function NavItem({ item, isActive, isCollapsed }) {
	if (isCollapsed) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						<Button
							variant={isActive ? "secondary" : "ghost"}
							size='icon'
							className={cn("w-full h-10", isActive && "bg-secondary")}
							asChild
						>
							<Link to={item.href}>
								<item.icon className='h-5 w-5' />
								<span className='sr-only'>{item.title}</span>
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent side='right' className='font-medium'>
						{item.title}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<Button
			variant={isActive ? "secondary" : "ghost"}
			size='sm'
			className={cn("w-full justify-start", isActive && "bg-secondary")}
			asChild
		>
			<Link to={item.href}>
				<item.icon className='mr-2 h-4 w-4' />
				{item.title}
			</Link>
		</Button>
	);
}

export function MobileSidebar({ children }) {
	return (
		<ScrollArea className='h-full'>
			<div className='flex flex-col gap-2'>{children}</div>
		</ScrollArea>
	);
}
