import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowRight, BarChart3, Layers, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
	return (
		<div className='space-y-10'>
			<section className='space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16'>
				<div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center'>
					<h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl'>
						Welcome to Reach Dashboard
					</h1>
					<p className='max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8'>
						A modern React dashboard application for monitoring and analyzing
						your data with powerful visualization tools.
					</p>
					<div className='flex flex-wrap justify-center gap-4'>
						<Button asChild size='lg'>
							<Link to='/dashboard'>
								Get Started
								<ArrowRight className='ml-2 h-4 w-4' />
							</Link>
						</Button>
						<Button variant='outline' size='lg'>
							<Link to='/analytics'>View Analytics</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className='container space-y-6 py-8 md:py-12 lg:py-16'>
				<div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
					<h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl'>
						Features
					</h2>
					<p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>
						Explore the powerful features that make Reach Dashboard the perfect
						solution for your data visualization needs.
					</p>
				</div>

				<div className='mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3'>
					<Card className='flex flex-col'>
						<CardHeader>
							<LineChart className='h-6 w-6 mb-2' />
							<CardTitle>Real-time Analytics</CardTitle>
							<CardDescription>
								Monitor your data in real-time with interactive charts and
								graphs.
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1'>
							<p>
								Get instant insights with live data updates and customizable
								metrics tracking.
							</p>
						</CardContent>
						<CardFooter>
							<Button variant='ghost' className='w-full'>
								<Link to='/dashboard' className='w-full'>
									Learn more
								</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card className='flex flex-col'>
						<CardHeader>
							<Layers className='h-6 w-6 mb-2' />
							<CardTitle>Customizable Dashboard</CardTitle>
							<CardDescription>
								Create personalized dashboards tailored to your specific needs.
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1'>
							<p>
								Drag and drop widgets, customize layouts, and save multiple
								dashboard configurations.
							</p>
						</CardContent>
						<CardFooter>
							<Button variant='ghost' className='w-full'>
								<Link to='/dashboard' className='w-full'>
									Learn more
								</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card className='flex flex-col'>
						<CardHeader>
							<BarChart3 className='h-6 w-6 mb-2' />
							<CardTitle>Data Visualization</CardTitle>
							<CardDescription>
								Visualize complex data sets with intuitive and interactive
								visualizations.
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1'>
							<p>
								Transform raw data into meaningful insights with beautiful
								charts, graphs, and tables.
							</p>
						</CardContent>
						<CardFooter>
							<Button variant='ghost' className='w-full'>
								<Link to='/analytics' className='w-full'>
									Learn more
								</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</section>
		</div>
	);
}

export default Home;
