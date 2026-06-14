"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthForm from '@/app/components/ui/AuthForm';

type SignUpForm = {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string
}

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
    userName: "",
    password: "",
    confirmPassword: "",
  });

  const { email, password, userName,  confirmPassword } = formData
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
      await register(formData.email,formData.userName,  formData.password)
      // register only returns { user } (no token), so we can't auto-login.
      // Send them to /signin to enter their credentials once.
      router.push("/signin")
    } catch (err) {
      if (err instanceof Error) setServerError(err.message); // e.g. "Email already exists"
    }
  }

  const inputClass = "rounded-lg bg-gray-300 hover:cursor-pointer"

  return (
     <AuthForm 
      email = {email}
      showUsername = {true}
      userName = {userName}
      password ={password}
      onSubmit = {handleSubmit}
      onChange = {handleChange}
      emailTitle = "Type your eamil: "
      passwordTitle = "Type your password"
      showConfirmPassword = {true}
      confirmPassword = {confirmPassword}
      buttonText = "Sign In"
      link = "/signin"
      linkText = "Already signed up?"
    />
  )
}

export default Page
