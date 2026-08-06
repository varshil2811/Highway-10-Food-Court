type Props = {
  name: string
  description?: string
  veg: boolean
  jain?: boolean
  price: string
  bestseller?: boolean
}

export default function MenuCard({ name, description, veg, jain, price, bestseller }: Props) {
  return (
    <article className="lux-card group flex flex-col p-4 md:p-5">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
            veg ? 'border-emerald-500' : 'border-red-500'
          }`}
          aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
          title={veg ? 'Veg' : 'Non-veg'}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${veg ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-bold leading-snug tracking-tight text-paper-cream md:text-lg">
              {name}
            </h3>
            <span className="shrink-0 font-body text-sm font-semibold text-route-yellow">{price}</span>
          </div>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-dusk-grey md:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        {bestseller && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.1)] px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-route-yellow">
            <span aria-hidden>★</span> Bestseller
          </span>
        )}
        {jain && (
          <span className="rounded-full border border-[rgba(212,175,55,0.2)] px-2.5 py-1 font-body text-[10px] uppercase tracking-wider text-dusk-grey">
            Jain
          </span>
        )}
      </div>
    </article>
  )
}
