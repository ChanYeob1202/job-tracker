"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

function Page() {

  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pw }),
    });

    if (res?.ok) {
      const data = await res.json();
      setToken(data.token);
      router.push("/");
    }
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
