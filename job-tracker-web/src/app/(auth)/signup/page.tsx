"use client"
import { useState  } from 'react' 

function Page() {

  const [ email, setEmail ] = useState<string>("");
  const [ password, setPassword ] = useState<string>("");
  const [ confirmPassword, setConfirmPassword ] = useState< string> ("");


  return (
    <form className = "flex flex-col">
      
    </form>
  )
}

export default Page
