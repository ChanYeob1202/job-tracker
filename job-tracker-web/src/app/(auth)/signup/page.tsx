"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string
}

/* 
signUpErrors' format = {
  email?: string,
  password?: string,
  confirmPassword?: string,
} 
*/

type SignUpErrors = Partial<Record<keyof SignUpForm, string>>

function Page() {
  const { user, isLoading: authLoading, register } = useAuth();
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      alert("you are already signed in!")
      router.replace("/");
    }
  }, [user, authLoading, router])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [serverError, setServerError] = useState("")

  const validate = (form: SignUpForm): SignUpErrors => {
    const nextErrors: SignUpErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      nextErrors.email = "invalid email"
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Password do not match";
    }
    if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    return nextErrors;
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setServerError(""); // clear any stale server error from a previous attempt
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return; // stop: don't call register while the form is invalid
    }
    try {
      await register(formData.email, formData.password)
      // register only returns { user } (no token), so we can't auto-login.
      // Send them to /signin to enter their credentials once.
      router.push("/signin")
    } catch (err) {
      if (err instanceof Error) setServerError(err.message); // e.g. "Email already exists"
    }
  }

  const inputClass = "rounded-lg bg-gray-300 hover:cursor-pointer"

  return (
    <>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          title='Enter your email'
          className={inputClass}
          required
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}
        {serverError && <p className="text-red-500">{serverError}</p>}
        <label>Password: </label>
        <input
          type='password'
          name='password'
          value={formData.password}
          onChange={handleChange}
          title='Enter your password'
          className={inputClass}
          required
        />

        {errors.password && <p className="text-red-500">{errors.password}</p>}

        <label>Comfirm Password:</label>
        <input
          type='password'
          name='confirmPassword'
          value={formData.confirmPassword}
          onChange={handleChange}
          title='Confirm password'
          className={inputClass}
          required
        />
        {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}

        <button type="submit">Sign up</button>
      </form>
      <Link
        href="/signin"
        className = "text-center underline font-light text-sm text-gray-400 hover:text-blue-500 hover:cursor-pointer"
      >
        Already have an account? 
      </Link>
    </>
  )
}

export default Page
