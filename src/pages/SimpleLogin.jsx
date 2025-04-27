import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Function to validate credentials
  const validateCredentials = (email, password) => {
    return email === "admin@example.com" && password === "password";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      if (validateCredentials(email, password)) {
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
      } else {
        setError("Invalid email or password. Try admin@example.com / password");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "400px", 
      margin: "40px auto", 
      border: "1px solid #ccc", 
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Login</h1>
      
      {error && (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          color: "#c62828", 
          borderRadius: "4px", 
          marginBottom: "20px" 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            style={{ 
              width: "100%", 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            style={{ 
              width: "100%", 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            width: "100%", 
            padding: "10px", 
            backgroundColor: "#1976d2", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      
      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666", textAlign: "center" }}>
        <p>Demo credentials:</p>
        <p>Email: admin@example.com</p>
        <p>Password: password</p>
      </div>
    </div>
  );
}
