export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Highway 10 The Food Court"
    >
      <defs>
        <mask id="plateMask">
          {/* White keeps everything visible */}
          <rect x="0" y="0" width="100" height="130" fill="white" />

          {/* Inner circle of the plate (hole) */}
          <circle cx="63" cy="74" r="10.5" fill="black" />

          {/* FORK */}
          {/* Fork main body (hole) */}
          <path d="M 45 56 L 45 66 Q 45 71 47.2 71 L 47.2 91 A 1 1 0 0 0 48.8 91 L 48.8 71 Q 51 71 51 66 L 51 56 Z" fill="black" />
          {/* Fork gaps (make them solid again, so they are not holes) */}
          <rect x="46.5" y="56" width="1" height="8" fill="white" />
          <rect x="48.5" y="56" width="1" height="8" fill="white" />

          {/* SPOON */}
          {/* Spoon head (hole) */}
          <ellipse cx="78" cy="62" rx="3.5" ry="6.5" fill="black" />
          {/* Spoon handle (hole) */}
          <rect x="77" y="67" width="2" height="24" fill="black" rx="1" />
        </mask>
      </defs>

      {/* Main Shield Outline (Border) */}
      <path
        d="M 10 100 L 10 40 Q 10 10 50 10 Q 90 10 90 40 L 90 100 Z"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="6"
      />

      {/* Yellow Top Background */}
      <path
        d="M 13 42 L 13 40 Q 13 13 50 13 Q 87 13 87 40 L 87 42 Z"
        fill="#FFE600"
      />

      {/* Horizontal Line separating top and bottom */}
      <line x1="7" y1="42" x2="93" y2="42" stroke="currentColor" strokeWidth="6" />

      {/* HIGHWAY text */}
      <text
        x="50"
        y="32"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#111"
        textAnchor="middle"
        letterSpacing="1"
      >
        HIGHWAY
      </text>

      {/* Number 1 */}
      <polygon
        points="19,60 27,53 35,53 35,92 23,92 23,62"
        fill="currentColor"
      />

      {/* Number 0 (Plate) */}
      <circle
        cx="63"
        y="74"
        r="19"
        fill="currentColor"
        mask="url(#plateMask)"
        cy="74"
      />

      {/* THE FOOD COURT text */}
      <text
        x="50"
        y="118"
        fontFamily="sans-serif"
        fontSize="8"
        fontWeight="800"
        fill="currentColor"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        THE FOOD COURT
      </text>
    </svg>
  )
}
