import type { ComponentType, SVGProps } from 'react'

interface QuickActionProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  hint: string
  onClick: () => void
}

export function QuickAction({ icon: Icon, label, hint, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
        <Icon width={20} height={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium text-slate-900">{label}</span>
        <span className="block truncate text-[13px] text-slate-500">{hint}</span>
      </span>
    </button>
  )
}
