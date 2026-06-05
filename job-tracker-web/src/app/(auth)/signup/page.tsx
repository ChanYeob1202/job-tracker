"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string
}

type SignUpErrors = Partial<Record<keyof SignUpForm, string>>


function Page() {
  const { user, isLoading:authLoading , register } = useAuth();
  const [ errors, setErrors ] = useState<SignUpErrors>({})
  const router = useRouter()
  
  useEffect(() => {
    if(!authLoading && user) {
      alert("you are already signed in!")
      router.replace("/");
    }
  }, [user, authLoading, router])


  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validate = (form: SignUpForm): SignUpErrors => {
    const errors: SignUpErrors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(formData.email)){
      errors.email = "invalid email"
    }

    if(form.password !== form.confirmPassword){
      errors.confirmPassword = "Password do not match";
    }
    if(form.password.length < 8 ) {
      errors.password = "Password must be at least 8 characters";
    } 
    return errors; 
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const errors = validate(formData);
    if(errors){
      setErrors(errors)
      console.log(errors);
      return;
    }
    register(formData.email, formData.password)
  }


  const inputClass = "rounded-lg bg-gray-300 hover:cursor-pointer"

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <label htmlFor="email">Email: </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        title='Enter your email'
        className = {inputClass}
        required
      />
      {errors.email && <p className = "text-red-500">{errors.email}</p>}

      <label>Password: </label>
      <input
        type='password'
        name='password'
        value={formData.password}
        onChange={handleChange}
        title='Enter your password'
        className = {inputClass}
        required
      />

      {errors.password &&<p className = "text-red-500">{errors.password}</p> }

      <label>Comfirm Password:</label>
      <input
        type='password'
        name='confirmPassword'
        value={formData.confirmPassword}
        onChange = {handleChange}
        title='Confirm password'
        className = {inputClass}
        required
      />
      {errors.confirmPassword && <p className = "text-red-500">{errors.confirmPassword}</p>}

      <p>have an account? <span><button onClick = {() => router.push("/signin")}>sign in</button></span></p>
      <button type = "submit">Sign up</button>
    </form>
  )
}

export default Page
