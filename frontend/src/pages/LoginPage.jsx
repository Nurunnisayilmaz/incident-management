import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const LoginPage = ({ setUser }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", form);
      const userData = res.data.data;
      localStorage.setItem('accessToken', userData.accessToken);
      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      });
      window.location.href = "/";
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-base-200">
      <form
        className="card bg-base-100 p-6 rounded-3xl shadow-xl w-full max-w-lg border border-base-300"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl mb-6 font-bold text-center text-base-content">
          Login
        </h2>
        {error && <p className="text-error mb-4">{error}</p>}
        <input
          type="email"
          placeholder="email"
          className="input input-bordered w-full mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="password"
          className="input input-bordered w-full mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-primary w-full">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;