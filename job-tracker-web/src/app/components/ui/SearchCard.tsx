"use client"

/* 
Title  = string 
Company name = string
Logo = string ? | null;
Tag = string | null 
Salary = string | null
Location = string;
postedTime = string; 
*/

import { SearchList } from "@/types/search"

function JobCard({ 
  id, title, company, location, salary_max, salary_min,description
}: SearchList) {
  return (
    <div>
      
    </div>
  )
}

export default JobCard
