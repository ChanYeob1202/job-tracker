"use client"
import { useRouter } from "next/navigation"



function AddJobButton() {
  
  const router = useRouter();


  return (
    <button 
      onClick = {() => router.push("/jobs/new")}
      className = "rounded-xl text-white font-bold px-4 py-2 bg-blue-600 hover:cursor-pointer">Add Job</button>
  )
}

export default AddJobButton
