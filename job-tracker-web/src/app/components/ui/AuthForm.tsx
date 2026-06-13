"use client"
import Link from "next/link"

type AuthFormProps = {
  email: string;
  showUsername: boolean; 
  userName?: string;
  password: string;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emailTitle: string;
  passwordTitle: string;
  confirmPassword?: string;
  buttonText: string;
  link: string;
  linkText: string;
}

function AuthForm({ email,showUsername, userName, password, emailTitle, passwordTitle, confirmPassword, onSubmit, onChange, buttonText, link, linkText }: AuthFormProps) {
  const labelClass = "mb-1 text-sm font-medium text-gray-700";
  const inputClass =
    "mb-4 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 " +
    "placeholder-gray-400 outline-none transition focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-200";

  return (
    <div className="mx-auto mt-10 flex w-full max-w-xs flex-col">
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
          </>
        }

        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          title={passwordTitle}
          className={inputClass}
        />

        {confirmPassword &&
          <>
            <label className={labelClass}>Confirm Password</label>
            <input
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              onChange={onChange}
              title='Confirm password'
              className={inputClass}
              required
            />
          </>
        }

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 hover:cursor-pointer"
        >
          {buttonText}
        </button>
      </form>
      <Link
        href={link}
        className="mt-4 text-center underline font-light text-sm text-gray-400 hover:text-blue-500 hover:cursor-pointer"
      >
        {linkText}
      </Link>
    </div>
  )
}

export default AuthForm
