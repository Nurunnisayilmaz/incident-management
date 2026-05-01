import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const RegisterPage = ({ setUser }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", form);
      window.location.href = "/login";
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-base-200">
      <form
        className="card bg-base-100 p-6 rounded-3xl shadow-xl w-full max-w-lg border border-base-300"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl mb-6 font-bold text-center text-base-content">
          Register
        </h2>
        {error && <p className="text-error mb-4">{error}</p>}
        <input
          type="text"
          placeholder="username"
          className="input input-bordered w-full mb-3"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
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
        <button className="btn btn-primary w-full">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;