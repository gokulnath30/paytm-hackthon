import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Brand'
import { Button } from '../components/ui'
import { EyeIcon, EyeOffIcon, LockIcon, PhoneIcon } from '../components/icons'
import { login } from '../lib/mockData'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState(login.phonePlaceholder)
  const [password, setPassword] = useState(login.passwordValue)
  const [showPassword, setShowPassword] = useState(false)

  function signIn() {
    navigate('/home')
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-canvas px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-7 flex justify-center sm:mb-9">
          <Wordmark size="md" />
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
          <h1 className="text-center text-2xl font-bold text-brand-900">{login.title}</h1>
          <p className="mt-1 text-center text-base text-ink-soft">{login.subtitle}</p>

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            <label className="flex h-12 items-center gap-2.5 rounded-xl border border-hairline bg-canvas px-3.5 focus-within:border-brand-400">
              <PhoneIcon width={18} height={18} className="shrink-0 text-ink-faint" />
              <span className="sr-only">Phone number</span>
              <input
                id="login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="nums min-w-0 flex-1 bg-transparent text-base text-ink outline-none"
              />
            </label>

            <label className="flex h-12 items-center gap-2.5 rounded-xl border border-hairline bg-canvas px-3.5 focus-within:border-brand-400">
              <LockIcon width={18} height={18} className="shrink-0 text-ink-faint" />
              <span className="sr-only">Password</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="shrink-0 text-ink-faint transition-colors hover:text-ink-soft"
              >
                {showPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
              </button>
            </label>

            <Button type="submit" className="mt-1 w-full">
              {login.signIn}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-sm text-ink-faint">or</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <button
            type="button"
            onClick={signIn}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-surface text-base font-semibold text-ink transition-colors hover:bg-canvas"
          >
            {login.paytmCta.replace(' Paytm', '')}
            <span className="font-bold text-brand-600">Paytm</span>
          </button>

          <p className="mt-5 text-center text-sm text-ink-soft">
            {login.newUser}{' '}
            <button type="button" onClick={signIn} className="font-semibold text-brand-600 hover:underline">
              {login.createAccount}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
