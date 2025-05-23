import { ModeToggle } from "@/components/mode-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isValidCredentials, setIsValidCredentials] = useState(false);
	const autoLoginTimeoutRef = useRef(null);

	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	// Get the redirect path from location state or default to dashboard
	const from = location.state?.from?.pathname || "/dashboard";

	// Function to validate credentials
	const validateCredentials = (email, password) => {
		return email === "admin@example.com" && password === "password";
	};

	// Function to handle login
	const performLogin = async () => {
		if (isLoading) return;

		setError("");
		setIsLoading(true);

		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Login successful
			const user = {
				id: "1",
				name: "Admin User",
				email: "admin@example.com",
				avatar: "https://github.com/shadcn.png",
			};

			login(user);
			navigate(from, { replace: true });
		} catch (err) {
			setError("An error occurred during login. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle form submission (manual login)
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (validateCredentials(email, password)) {
			performLogin();
		} else {
			setError("Invalid email or password. Try admin@example.com / password");
		}
	};

	// Handle password input change
	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);

		// Clear any existing timeout
		if (autoLoginTimeoutRef.current) {
			clearTimeout(autoLoginTimeoutRef.current);
		}

		// Check if credentials are valid
		const valid = validateCredentials(email, newPassword);
		setIsValidCredentials(valid);

		// If credentials are valid, set a timeout to auto-login
		if (valid) {
			// Add a small delay to allow user to see that password is correct
			autoLoginTimeoutRef.current = setTimeout(() => {
				performLogin();
			}, 500);
		}
	};

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (autoLoginTimeoutRef.current) {
				clearTimeout(autoLoginTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-background p-4'>
			<div className='absolute top-4 right-4'>
				<ModeToggle />
			</div>

			<div className='w-full max-w-md'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold'>Reach Dashboard</h1>
					<p className='text-muted-foreground mt-2'>Sign in to your account</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Login</CardTitle>
						<CardDescription>
							Enter your credentials to access your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-4'>
							{error && (
								<Alert variant='destructive' className='mb-4'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='admin@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='password'>Password</Label>
									<Link
										to='/forgot-password'
										className='text-sm text-primary hover:underline'
									>
										Forgot password?
									</Link>
								</div>
								<Input
									id='password'
									type='password'
									placeholder='password'
									value={password}
									onChange={handlePasswordChange}
									required
								/>
							</div>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? "Signing in..." : "Sign in"}
							</Button>
						</form>
					</CardContent>
					<CardFooter className='flex flex-col space-y-4'>
						<div className='text-sm text-center text-muted-foreground'>
							Don't have an account?{" "}
							<Link to='/register' className='text-primary hover:underline'>
								Sign up
							</Link>
						</div>

						<div className='text-xs text-center text-muted-foreground'>
							<p>Demo credentials:</p>
							<p>Email: admin@example.com</p>
							<p>Password: password</p>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
