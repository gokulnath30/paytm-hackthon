import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wordmark, PoweredBy } from '../components/Brand'
import { splash } from '../lib/mockData'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 2200)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <button
      type="button"
      onClick={() => navigate('/login', { replace: true })}
      aria-label="Continue to sign in"
      className="flex min-h-dvh w-full flex-col items-center justify-between bg-gradient-to-b from-[#fdfcf7] via-canvas to-brand-50 px-6 py-14 text-center"
    >
      <div />

      <div className="flex flex-col items-center gap-3">
        <Wordmark size="lg" />
        <p className="text-base text-ink-soft">{splash.tagline}</p>
        <PoweredBy className="mt-2" />
      </div>

      <ShopIllustration sign={splash.shopSign} />
    </button>
  )
}

/** Storefront illustration with the shop's signboard. */
function ShopIllustration({ sign }: { sign: string }) {
  return (
    <div className="w-full max-w-sm">
      <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`Kirana storefront, sign reads ${sign}`}>
        <ellipse cx="160" cy="176" rx="140" ry="10" fill="#dbe7fe" />

        {/* trees */}
        <circle cx="36" cy="128" r="20" fill="#bbf3d0" />
        <rect x="33" y="140" width="6" height="26" rx="2" fill="#9bd8b4" />
        <circle cx="286" cy="132" r="17" fill="#bbf3d0" />
        <rect x="283" y="142" width="6" height="24" rx="2" fill="#9bd8b4" />

        {/* building */}
        <rect x="70" y="72" width="180" height="94" rx="6" fill="#ffffff" stroke="#e3e9f2" strokeWidth="2" />

        {/* signboard */}
        <rect x="56" y="52" width="208" height="30" rx="8" fill="#13315c" />
        <text
          x="160"
          y="72"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#ffffff"
          fontFamily="system-ui, sans-serif"
          textLength="184"
          lengthAdjust="spacingAndGlyphs"
        >
          {sign}
        </text>

        {/* awning */}
        <path d="M70 82h180v18H70z" fill="#f7b955" />
        <path d="M70 100h180l-10 10H80z" fill="#e8a53f" />
        <path d="M88 82v18M106 82v18M124 82v18M142 82v18M160 82v18M178 82v18M196 82v18M214 82v18M232 82v18" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3" />

        {/* door + windows */}
        <rect x="142" y="118" width="36" height="48" rx="3" fill="#dbe7fe" stroke="#bfd4fe" strokeWidth="2" />
        <circle cx="171" cy="143" r="2" fill="#6090fa" />
        <rect x="92" y="118" width="38" height="30" rx="3" fill="#eef4ff" stroke="#bfd4fe" strokeWidth="2" />
        <rect x="190" y="118" width="38" height="30" rx="3" fill="#eef4ff" stroke="#bfd4fe" strokeWidth="2" />

        {/* crates */}
        <rect x="88" y="152" width="26" height="14" rx="2" fill="#f7b955" />
        <rect x="196" y="152" width="26" height="14" rx="2" fill="#bbf3d0" />
      </svg>
    </div>
  )
}
