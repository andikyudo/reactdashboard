import Layout from "@/components/layout/Layout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Analytics from "@/pages/Analytics";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import MapPage from "@/pages/MapPage";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Placeholder components for additional routes
const Reports = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Reports</h1>
		<p>This is a placeholder for the Reports page.</p>
	</div>
);
const Users = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Users</h1>
		<p>This is a placeholder for the Users page.</p>
	</div>
);
const Statistics = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Statistics</h1>
		<p>This is a placeholder for the Statistics page.</p>
	</div>
);
const Calendar = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Calendar</h1>
		<p>This is a placeholder for the Calendar page.</p>
	</div>
);
const Messages = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Messages</h1>
		<p>This is a placeholder for the Messages page.</p>
	</div>
);
const Help = () => (
	<div className='space-y-4'>
		<h1 className='text-3xl font-bold'>Help</h1>
		<p>This is a placeholder for the Help page.</p>
	</div>
);

function App() {
	const [layoutType, setLayoutType] = useState(() => {
		return localStorage.getItem("reach-dashboard-layout") || "navbar";
	});

	// Toggle layout function
	const toggleLayout = () => {
		const newLayout = layoutType === "navbar" ? "sidebar" : "navbar";
		setLayoutType(newLayout);
		localStorage.setItem("reach-dashboard-layout", newLayout);
	};

	// Layout component based on user preference
	const LayoutComponent = layoutType === "sidebar" ? SidebarLayout : Layout;

	return (
		<AuthProvider>
			<ThemeProvider defaultTheme='light' storageKey='reach-dashboard-theme'>
				<Routes>
					{/* Public routes */}
					<Route path='/login' element={<Login />} />

					{/* Protected routes */}
					<Route
						path='/'
						element={
							<ProtectedRoute>
								<LayoutComponent
									toggleLayout={toggleLayout}
									layoutType={layoutType}
								/>
							</ProtectedRoute>
						}
					>
						<Route index element={<Home />} />
						<Route path='dashboard' element={<Dashboard />} />
						<Route path='analytics' element={<Analytics />} />
						<Route path='reports' element={<Reports />} />
						<Route path='users' element={<Users />} />
						<Route path='statistics' element={<Statistics />} />
						<Route path='map' element={<MapPage />} />
						<Route path='calendar' element={<Calendar />} />
						<Route path='messages' element={<Messages />} />
						<Route path='settings' element={<Settings />} />
						<Route path='help' element={<Help />} />
						<Route path='*' element={<NotFound />} />
					</Route>

					{/* Redirect any unmatched routes */}
					<Route path='*' element={<Navigate to='/login' replace />} />
				</Routes>
			</ThemeProvider>
		</AuthProvider>
	);
}

export default App;
