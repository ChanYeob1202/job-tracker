type SignInFormProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (v: string) => void;
  pw: string;
  setPw: (v: string) => void;
};

function SignInForm({ handleSubmit, email, setEmail, setPw, pw }: SignInFormProps) {
  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <label>Email: </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        title="Enter a valid email"
        required
      />

      <label>Password: </label>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        title="Enter password"
        required
      />

      <button type="submit">Sign In</button>
    </form>
  );
}

export default SignInForm;
