"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

/* 
  TODO: accessible even if already user signed in
  ? may be 1. get token from localstorage and verifies it. if not expired => redirect with alert (you are already signed in!);
*/

function Page() {
  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const { login } = useAuth();

  useEffect(()=> {
    (async() => {
      const res = await apiFetch("/auth/me")
      if(res){
        alert("You are already signed in!")
        window.location.href = "/"
      }
    })()
  }, [])

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const res = login(email, pw);
    return res;
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
