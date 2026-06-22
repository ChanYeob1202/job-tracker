"use client"
import Link from "next/link"

type AuthFormErrors = {
  email?: string;
  userName?: string;
  password?: string;
  confirmPassword?: string;
}

type AuthFormProps = {
  email: string;
  showUsername: boolean;
  userName?: string;
  password: string;
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

function AuthForm({ email,showUsername, userName, password, emailTitle, passwordTitle, showConfirmPassword, confirmPassword, onSubmit, onChange, buttonText, buttonDisabled,  link, linkText, errors, serverError }: AuthFormProps) {
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
        <label htmlFor="email" className={labelClass}>email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          title={emailTitle}
          className={inputClass}
          required
        />
        {errors?.email &&
          <p role="alert" className={fieldErrorClass}>{errors.email}</p>
        }

        {showUsername &&
          <>
            <label htmlFor="userName" className={labelClass}>User Name</label>
            <input
              type="text"
              name="userName"
              value={userName}
              onChange={onChange}
              title="userName"
              className={inputClass}
            />
            {errors?.userName &&
              <p role="alert" className={fieldErrorClass}>{errors.userName}</p>
            }
          </>
        }

        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          type="password"
          name="password"
          value={password}
          autoComplete="new-password"
          onChange={onChange}
          title={passwordTitle}
          className={inputClass}
        />
        {errors?.password &&
          <p role="alert" className={fieldErrorClass}>{errors.password}</p>
        }

        {showConfirmPassword &&
          <>
            <label className={labelClass}>Confirm Password</label>
            <input
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              autoComplete="new-password"
              onChange={onChange}
              title='Confirm password'
              className={inputClass}
              required
            />
            {errors?.confirmPassword &&
              <p role="alert" className={fieldErrorClass}>{errors.confirmPassword}</p>
            }
          </>
        }

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
