import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import {
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	Menu,
	Sidebar as SidebarIcon,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { MobileSidebar, Sidebar } from "./Sidebar";

export default function SidebarLayout({ toggleLayout, layoutType }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(() => {
		return localStorage.getItem("sidebar-collapsed") === "true";
	});

	// Save collapsed state to localStorage
	useEffect(() => {
		localStorage.setItem("sidebar-collapsed", isCollapsed.toString());
	}, [isCollapsed]);

	return (
		<div className='relative min-h-screen flex'>
			{/* Desktop Sidebar */}
			<aside
				className={cn(
					"hidden lg:block border-r bg-background transition-all duration-300 ease-in-out",
					isCollapsed ? "w-16" : "w-64"
				)}
			>
				<div className='relative h-full'>
					<Sidebar isCollapsed={isCollapsed} />

					{/* Collapse Toggle Button */}
					<Button
						variant='ghost'
						size='icon'
						className='absolute top-4 -right-3 rounded-full border shadow-sm bg-background z-10'
						onClick={() => setIsCollapsed(!isCollapsed)}
					>
						{isCollapsed ? (
							<ChevronRight className='h-4 w-4' />
						) : (
							<ChevronLeft className='h-4 w-4' />
						)}
					</Button>
				</div>
			</aside>

			{/* Mobile Sidebar */}
			<Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
				<SheetContent side='left' className='p-0 w-64'>
					<MobileSidebar>
						<div className='flex items-center justify-between p-4 border-b'>
							<h2 className='text-lg font-semibold'>Reach Dashboard</h2>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setIsSidebarOpen(false)}
							>
								<X className='h-5 w-5' />
							</Button>
						</div>
						<Sidebar />
					</MobileSidebar>
				</SheetContent>
			</Sheet>

			{/* Main Content */}
			<div className='flex-1 flex flex-col'>
				<header className='sticky top-0 z-40 h-16 border-b bg-background'>
					<div className='flex h-full items-center gap-4 px-4'>
						<Button
							variant='outline'
							size='icon'
							className='lg:hidden'
							onClick={() => setIsSidebarOpen(true)}
						>
							<Menu className='h-5 w-5' />
							<span className='sr-only'>Toggle sidebar</span>
						</Button>
						<div className='flex-1' />
						<Button
							variant='ghost'
							size='icon'
							onClick={toggleLayout}
							title={
								layoutType === "navbar"
									? "Switch to Sidebar Layout"
									: "Switch to Navbar Layout"
							}
						>
							{layoutType === "navbar" ? (
								<LayoutDashboard className='h-5 w-5' />
							) : (
								<SidebarIcon className='h-5 w-5' />
							)}
						</Button>
						<UserMenu />
						<ModeToggle />
					</div>
				</header>
				<main className='flex-1 overflow-auto p-4 md:p-6'>
					<Outlet />
				</main>
				<footer className='border-t py-4 bg-background'>
					<div className='container mx-auto text-center text-sm text-muted-foreground'>
						<p>
							&copy; {new Date().getFullYear()} Reach Dashboard. All rights
							reserved.
						</p>
					</div>
				</footer>
			</div>

			{/* Fixed Layout Toggle Button (Mobile) */}
			<Button
				className='fixed bottom-4 right-4 rounded-full shadow-lg lg:hidden'
				size='icon'
				onClick={toggleLayout}
				title={
					layoutType === "navbar"
						? "Switch to Sidebar Layout"
						: "Switch to Navbar Layout"
				}
			>
				{layoutType === "navbar" ? (
					<LayoutDashboard className='h-5 w-5' />
				) : (
					<SidebarIcon className='h-5 w-5' />
				)}
			</Button>
		</div>
	);
}
