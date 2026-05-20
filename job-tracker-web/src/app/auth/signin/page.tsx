"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"


function page() {

  const [ email, setEmail ] = useState<string>("");
  const [ pw, setPw ] = useState<string>(""); 



  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {


  }

  return (
    <form
      className = "flex flex-col" 
      onSubmit = {handleSubmit}
    >
      <label>Email: </label>
      <input 
        type = "email"
        value={email}
        onChange = { (e) => setEmail(e.target.value)}
        title = "Enter a valid email"
        required
      />
      
      <label>Password: </label>
      <input 
        type="password"
        value={pw}
        onChange = { (e) => setPw(e.target.value)}
        title="Enter password"
        required
      />

      <button 
        type="submit"
      >
        Sign In
      </button>
      

    
      
    </form>
  )
}

export default page
