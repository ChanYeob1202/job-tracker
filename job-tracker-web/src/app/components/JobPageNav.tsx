"use client"
import { useState } from 'react'
import { useRouter } from "next/navigation";


export default function JobPageNav() {

  const router = useRouter();

  return (
    <nav className="relative z-10 flex flex-wrap items-baseline gap-4 pb-4 border-b font-bold">
      <h1 className="text-lg">
        <div 
          onClick = {() => router.push("/")}
          className="hover:cursor-pointer hover:opacity-70">
          Jobs
        </div>
      </h1>
      <div
        onClick = {() => router.push("/jobs/new")}
        className="hover:cursor-pointer hover:opacity-70"
      >
        Add Job
      </div>
    </nav>
  );
}
