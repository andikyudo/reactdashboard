import { Button } from "@/components/ui/button";
import { LayoutDashboard, Sidebar } from "lucide-react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout({ toggleLayout, layoutType }) {
	return (
		<div className='relative min-h-screen flex flex-col'>
			<Navbar toggleLayout={toggleLayout} layoutType={layoutType} />
			<main className='flex-1 container mx-auto py-6 px-4'>
				<Outlet />
			</main>
			<footer className='border-t py-6 bg-background'>
				<div className='container mx-auto text-center text-sm text-muted-foreground'>
					<p>
						&copy; {new Date().getFullYear()} Reach Dashboard. All rights
						reserved.
					</p>
				</div>
			</footer>

			{/* Fixed Layout Toggle Button */}
			<Button
				className='fixed bottom-4 right-4 rounded-full shadow-lg'
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
					<Sidebar className='h-5 w-5' />
				)}
			</Button>
		</div>
	);
}

export default Layout;
