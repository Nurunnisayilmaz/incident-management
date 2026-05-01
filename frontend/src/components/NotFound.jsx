import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl rounded-3xl p-10 text-center border border-base-content/10 max-w-2xl">
        <p className="text-4xl font-bold text-base-content mb-4">404</p>
        <p className="text-xl text-base-content/80">
          Page not found.
        </p>
      </div>
    </div>
  );
};

export default NotFound;