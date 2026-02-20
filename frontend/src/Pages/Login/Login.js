import { useState } from "react";
import "./Login.css";
import authService from "../../services/authService";  // <-- corrected path

console.log("SECRET:", process.env.JWT_SECRET);
console.log("EXPIRES:", process.env.JWT_EXPIRES_IN);

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await authService.login(form);
      localStorage.setItem("token", token);
      alert("Login successful!");
     window.location.href = "/home"; // redirect to Home
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
