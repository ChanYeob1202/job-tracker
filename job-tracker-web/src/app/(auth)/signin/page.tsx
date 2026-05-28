"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function Page() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    return login(email, pw);
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <label>Email: </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        title="Enter a valid email"
        required
      />

      <label>Password: </label>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        title="Enter password"
        required
      />

      <button type="submit">Sign In</button>
    </form>
  );
}

export default Page;
