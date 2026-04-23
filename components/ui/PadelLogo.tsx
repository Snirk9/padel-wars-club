export function PadelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0EA5E9" />
      {/* Racket 1: top-left to bottom-right (-45°) */}
      <g transform="rotate(-45 16 16)">
        <rect x="13" y="4" width="6" height="10" rx="3" fill="white" opacity="0.95" />
        <rect x="14.5" y="14" width="3" height="7" rx="1" fill="white" opacity="0.75" />
      </g>
      {/* Racket 2: top-right to bottom-left (+45°) */}
      <g transform="rotate(45 16 16)">
        <rect x="13" y="4" width="6" height="10" rx="3" fill="white" opacity="0.95" />
        <rect x="14.5" y="14" width="3" height="7" rx="1" fill="white" opacity="0.75" />
      </g>
    </svg>
  );
}
