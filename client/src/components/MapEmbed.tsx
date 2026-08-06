import site from '../data/site.json'

type Props = {
  className?: string
  height?: string
}

export default function MapEmbed({ className = '', height = 'h-72 lg:h-96' }: Props) {
  return (
    <div className={className}>
      <a
        href={site.maps}
        target="_blank"
        rel="noreferrer"
        className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.125rem] border border-[rgba(212,175,55,0.2)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-500 hover:border-route-yellow hover:shadow-[0_8px_28px_rgba(212,175,55,0.28)] ${height}`}
      >
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
          alt="Map background"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-asphalt/60 transition-colors duration-500 group-hover:bg-asphalt/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center px-4 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mb-3 text-route-yellow drop-shadow-md transition-transform duration-500 group-hover:-translate-y-1"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <h3 className="font-serif text-3xl font-bold tracking-tight text-paper-cream drop-shadow-md md:text-4xl">
            Get Directions
          </h3>
          <p className="mt-2 font-body text-sm font-medium text-paper-cream/90 drop-shadow-md md:text-base">
            SH-25, Lalpur Rajkot Bypass, Jamnagar
          </p>
        </div>
      </a>
    </div>
  )
}
