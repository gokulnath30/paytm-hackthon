import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const MicIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 19v3M8 22h8" />
  </svg>
)

export const BackIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 11.5L12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
)

export const BoxIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
)

export const CartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.5 3h2l2.8 12.5a2 2 0 0 0 2 1.5h8.4a2 2 0 0 0 2-1.6L21.5 8H6" />
  </svg>
)

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </svg>
)

export const MoreIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const DotsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

export const BellIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
)

export const StoreIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9h16v11H4z" />
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M9 20v-6h6v6" />
  </svg>
)

export const SunIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
)

export const UsersIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
    <circle cx="10" cy="8" r="3.2" />
    <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
    <path d="M15.5 5a3.2 3.2 0 0 1 0 6.2" />
  </svg>
)

export const TagIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20.6 13.4L12 4.8H4.8V12l8.6 8.6a1.7 1.7 0 0 0 2.4 0l4.8-4.8a1.7 1.7 0 0 0 0-2.4z" />
    <circle cx="8.4" cy="8.4" r="1.2" />
  </svg>
)

export const AlertIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10.3 3.9L1.9 18a1.5 1.5 0 0 0 1.3 2.2h17.6A1.5 1.5 0 0 0 22.1 18L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export const CheckCircleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.3l2.4 2.4 4.6-5.2" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export const FilterIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 5h18M7 12h10M10 19h4" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MinusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12h14" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const SendIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 12l16-8-5.5 16-3-6.5z" />
  </svg>
)

export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </svg>
)

export const LockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </svg>
)

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
)

export const EyeOffIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10.7 6.1A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.3 4" />
    <path d="M6.3 7.9A16.7 16.7 0 0 0 2 12s3.6 6.5 10 6.5a9.8 9.8 0 0 0 4-.8" />
    <path d="M3 3l18 18" />
  </svg>
)

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
)

export const RefreshIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 11a8 8 0 1 0-.7 4.3" />
    <path d="M20 5v6h-6" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13h10l1-13" />
  </svg>
)

export const ReceiptIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 3h14v18l-2.3-1.6-2.3 1.6-2.4-1.6L9.6 21l-2.3-1.6L5 21z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)

export const TrendUpIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 16l6-6 3.5 3.5L20 7" />
    <path d="M15 7h5v5" />
  </svg>
)

/** The two AI agents are shown as friendly robot avatars throughout. */
export const RobotIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4" y="7.5" width="16" height="12" rx="4" />
    <circle cx="9.2" cy="13.2" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="14.8" cy="13.2" r="1.4" fill="currentColor" stroke="none" />
    <path d="M12 7.5v-3M12 4.5h.01" />
  </svg>
)
