import type { ReactNode } from 'react'

/** Phone-width app shell: fills the viewport on mobile, centers as a card on wider screens/desktop tabs. */
export function Screen({ children, bg = 'bg-slate-50' }: { children: ReactNode; bg?: string }) {
  return (
    <div className="flex min-h-dvh justify-center bg-slate-200 sm:py-6">
      <div className={`flex w-full max-w-md flex-col ${bg} sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2rem] sm:shadow-2xl sm:overflow-hidden`}>
        {children}
      </div>
    </div>
  )
}
