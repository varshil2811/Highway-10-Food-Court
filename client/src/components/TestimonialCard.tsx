type Props = {
  quote: string
  name: string
  meta: string
  dark?: boolean
}

export default function TestimonialCard({ quote, name, meta }: Props) {
  return (
    <blockquote className="lux-card flex h-full flex-col">
      <p className="flex-1 font-serif text-lg font-bold italic leading-relaxed text-paper-cream/90">
        “{quote}”
      </p>
      <footer className="mt-5 border-t border-[rgba(212,175,55,0.2)] pt-4">
        <cite className="font-display not-italic text-sm font-semibold text-route-yellow">{name}</cite>
        <div className="mt-1 font-body text-[10px] uppercase tracking-[0.16em] text-dusk-grey">
          {meta}
        </div>
      </footer>
    </blockquote>
  )
}
