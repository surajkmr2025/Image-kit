"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await signOut({
        callbackUrl: "/login",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="btn btn-error"
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Signing out...
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}