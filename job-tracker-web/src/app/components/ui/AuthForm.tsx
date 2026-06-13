"use client"
import Link from "next/link"

type AuthFormProps = {
  email: string;
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

function AuthForm({ email, password, emailTitle, passwordTitle, confirmPassword,  onSubmit, onChange, buttonText, link, linkText}: AuthFormProps) {
  return (
    <>
      <form className="flex flex-col" onSubmit={onSubmit}>
        <label htmlFor="email">email: </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          title={emailTitle}
          required
        />

        <label htmlFor="password">Pasword: </label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          title={passwordTitle}
          className=""
        />

        {confirmPassword ?
          <>
            <label>Comfirm Password:</label>
            <input
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              onChange={onChange}
              title='Confirm password'
              className=""
              required
            />
          </>
          :
          null}
          
          <button type="submit">{buttonText}</button>
      </form>
      <Link
        href={link}
        className = "text-center underline font-light text-sm text-gray-400 hover:text-blue-500 hover:cursor-pointer"
      >
        {linkText}
      </Link>
    </>
  )
}

export default AuthForm
