"use client"
import Link from "next/link"

type AuthFormErrors = {
  email?: string;
  userName?: string;
  password?: string;
  confirmPassword?: string;
  jobTitle?: string;
}

// One entry per input. `show` lets sign-in and sign-up share this list —
// sign-in just filters the sign-up-only fields out.
type AuthField = {
  name: keyof AuthFormErrors;
  label: string;
  type: string;
  value?: string;
  title?: string;
  autoComplete?: string;
  required?: boolean;
  show: boolean;
}

type AuthFormProps = {
  email: string;
  showUsername: boolean;
  userName?: string;
  password: string;
  jobTitle?: string;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emailTitle: string;
  passwordTitle: string;
  showConfirmPassword?: boolean;
  confirmPassword?: string;
  buttonText: string;
  buttonDisabled:  boolean;
  link: string;
  linkText: string;
  errors?: AuthFormErrors;
  serverError?: string;
}

function AuthForm({ email,showUsername, userName, password, emailTitle, passwordTitle, jobTitle,  showConfirmPassword, confirmPassword, onSubmit, onChange, buttonText, buttonDisabled,  link, linkText, errors, serverError }: AuthFormProps) {
  const labelClass = "mb-1 text-sm font-medium text-gray-700";
  // Field errors sit just under their input; -mt-4 pulls them up against the input's mb-4 gap.
  const fieldErrorClass = "-mt-3 mb-3 text-sm text-red-600";
  const inputClass =
    "mb-4 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 " +
    "placeholder-gray-400 outline-none transition focus:border-brand-500 " +
    "focus:ring-2 focus:ring-brand-200";

  // showUsername is true only on the sign-up page, so it cleanly distinguishes the two modes.
  const heading = showUsername ? "Create your account" : "Welcome back";
  const subheading = showUsername
    ? "Start tracking your applications in minutes."
    : "Sign in to pick up where you left off.";  

  const fields: AuthField[] = [
    {
      name: "email",
      label: "Email", 
      type: "email",
      value: email,
      title: emailTitle,
      required: true,
      show: true,
    },
    {  
      name: "userName",
      label: "User Name",
      type: "text",
      value: userName,
      title: "userName",
      required: true,
      show: showUsername,
    },
    {
      name: "jobTitle",
      label: "Job Title",
      type: "text",
      value: jobTitle,
      title: "The kind of role you want to see on your search page",
      required: true,
      show: showUsername,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      value: password,
      title: passwordTitle,
      autoComplete: "new-password",
      show: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      value: confirmPassword,
      title: "Confirm password",
      autoComplete: "new-password",
      required: true,
      show: Boolean(showConfirmPassword),
    },
  ];

  return (
    <div className="relative isolate mx-auto mt-16 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-brand-500/5">
      {/* Brand gradient strip across the top of the card */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-brand-600 via-accent-600 to-sky-500"
      />

      <div className="mb-6 text-center">
        <h1 className="bg-linear-to-r from-brand-600 to-accent-600 bg-clip-text text-2xl font-bold text-transparent">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{subheading}</p>
      </div>

      <form className="flex flex-col" onSubmit={onSubmit}>
        {fields.filter((field) => field.show).map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className={labelClass}>{field.label}</label>
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={field.value ?? ""}
              onChange={onChange}
              title={field.title}
              autoComplete={field.autoComplete}
              required={field.required}
              className={inputClass}
            />
            {errors?.[field.name] &&
              <p role="alert" className={fieldErrorClass}>{errors[field.name]}</p>
            }
          </div>
        ))}

        {serverError &&
          <p role="alert" className="mb-2 text-sm text-red-600">{serverError}</p>
        }

        <button
          type="submit"
          disabled = {buttonDisabled}
          className="mt-2 rounded-lg bg-linear-to-r from-brand-600 to-accent-600 px-4 py-2 font-semibold text-white shadow-sm shadow-brand-500/30 transition hover:cursor-pointer hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
        >
          {buttonText}
        </button>
      </form>
      <Link
        href={link}
        className="mt-6 text-center text-sm font-medium text-gray-500 transition hover:text-brand-600 hover:cursor-pointer"
      >
        {linkText}
      </Link>
    </div>
  )
}

export default AuthForm
