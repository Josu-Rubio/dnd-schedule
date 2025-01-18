"use client";

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return <button onClick={handleLogin}>Login with Discord</button>;
}