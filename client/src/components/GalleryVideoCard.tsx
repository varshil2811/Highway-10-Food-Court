import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  alt: string
  isActive?: boolean // If it's opened in a modal
}

export default function GalleryVideoCard({ src, alt, isActive = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Intersection Observer for auto-play when visible
  useEffect(() => {
    if (isActive) return // If in a modal, don't use intersection observer

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {
              // Ignore autoplay errors (usually due to lack of user interaction if unmuted somehow)
            })
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 } // Play when at least 50% is visible
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isActive])

  // If opened in modal (isActive = true), auto play
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [isActive])

  // Automatically generate a thumbnail URL if hosted on Cloudinary
  const isCloudinary = src.includes('res.cloudinary.com')
  const posterUrl = isCloudinary ? src.replace(/\.(mp4|webm|mov)$/i, '.jpg') : undefined

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${!isActive ? 'aspect-[9/16]' : 'aspect-auto'}`}>
      <video
        ref={videoRef}
        src={src}
        title={alt}
        poster={posterUrl}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />
      
      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none transition-colors duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Mute/Unmute Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsMuted(!isMuted)
        }}
        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-colors z-10"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.316.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.316.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
          </svg>
        )}
      </button>

      {/* Manual play/pause overlay for entire card */}
      <div 
        className="absolute inset-0 cursor-pointer z-0"
        onClick={(e) => {
          e.stopPropagation();
          if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
          }
        }}
      />
    </div>
  )
}
