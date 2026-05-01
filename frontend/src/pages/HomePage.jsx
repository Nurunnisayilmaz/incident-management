import React from "react";
import { Link } from "react-router-dom";

const HomePage = ({ user, error }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-base-200">
      <div className="card bg-base-100 p-8 rounded-3xl shadow-xl w-full max-w-lg text-center border border-base-300">
        {error && <p className="text-error mb-4">{error}</p>}
        {user ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-base-content">
              Welcome, {user.username}!
            </h2>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-y-4">
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-outline w-full"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;