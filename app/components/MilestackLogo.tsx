interface MilestackLogoProps {
  size?: number;
}

export function MilestackLogo({ size = 40 }: MilestackLogoProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#0A84FF"/>
          <stop offset="1" stopColor="#00D1FF"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="20" fill="transparent"/>
      <g transform="translate(20,28)">
        <rect x="0" y="44" rx="10" width="80" height="14" fill="url(#g1)"/>
        <rect x="6" y="24" rx="10" width="68" height="14" fill="#0A84FF"/>
        <rect x="12" y="4" rx="10" width="56" height="14" fill="#00D1FF"/>
        <rect x="52" y="-4" width="4" height="26" rx="2" fill="#1E1E1E"/>
        <path d="M56 -2 H76 L62 8 Z" fill="#7F5AF0"/>
      </g>
    </svg>
  );
}
