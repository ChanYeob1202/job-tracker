"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/app/components/ui/AuthForm";

// TODO: log in failed dispalyed on browser, do not display server error only FE error (e.g. ❌ no display "Log in failed" ✅ "email and apssword do not match" )

type SignInForm = {
  email: string;
  password: string;
}

type SignInErrors = Partial<Record<keyof SignInForm, string>>

function Page() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [formData, setFormData] = useState<SignInForm>({
    email: "",
    password: ""
  })
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const { email, password } = formData
  const [errors, setErrors] = useState<SignInErrors>({}); //client, pre-field
  const [serverError, setServerError] = useState("") //server, one string 


  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);


  const validate = (form: SignInForm) => {
    const nextErrors: SignInErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      nextErrors.email = "Invalid email"
    }
    if (password.length <= 8) {
      nextErrors.password = "Password should be longer than 8"
    }
    return nextErrors
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (evt: React.SubmitEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setServerError(""); // clear any stale error from a previous attempt
    const nextErrors = validate(formData);
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // login() redirects to "/" on success; on failure it throws the server's message.
      await login(email, password);
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <AuthForm
      email={email}
      showUsername={false}
      password={password}
      onSubmit={handleSubmit}
      onChange={handleChange}
      emailTitle="Type your eamil: "
      passwordTitle="Type your Password: "
      buttonText={ isSubmitting ? "loading..." : "Sign in"}
      buttonDisabled = { isSubmitting }
      link="/signup"
      linkText="Don't have an account?"
      errors={errors}
      serverError={serverError}
    />
  );
}

export default Page;
