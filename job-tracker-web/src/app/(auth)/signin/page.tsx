"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";


function Page() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [ formData, setFormData ] = useState({
    email: "",
    password: ""
  })

  const { email, password } = formData 

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);
  
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  }


  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        console.log("[server error in sign in]: ", error.message);
      }
    }
  };

  return (
    <>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label>Email: </label>
        <input
          type="email"
          name = "email"
          value={email}
          onChange = { handleChange }
          title="Enter a valid email"
          required
        />

        <label>Password: </label>
        <input
          type="password"
          name = "password"
          value={password}
          onChange={handleChange}
          title="Enter password"
          required
        />
        <button type="submit">Sign In</button>
      </form>
      <Link
        href = "/signup"
        className = "text-center underline font-light text-sm text-gray-400 hover:text-blue-500 hover:cursor-pointer"
        >
          Don&apos;t have an account? 
      </Link>
    </>
  );
}

export default Page;
