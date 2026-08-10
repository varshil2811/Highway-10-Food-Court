import { Link } from 'react-router-dom'
import site from '../data/site.json'

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(212,175,55,0.2)] bg-asphalt text-paper-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-3 md:px-8 md:pl-20">
        <div>
          <div className="font-serif text-2xl font-bold tracking-tight text-route-yellow">
            Highway 10
          </div>
          <p className="mt-3 text-sm leading-relaxed text-dusk-grey">{site.tagline}</p>
          <p className="mt-5 text-xs leading-relaxed text-dusk-grey/80">{site.address}</p>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-route-yellow">
            Visit
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-dusk-grey">
            <li>
              <span className="text-dusk-grey/70">Hours · </span>
              {site.hours}
            </li>
            <li>
              <a
                href={`tel:${site.phoneRaw}`}
                className="transition-colors duration-300 hover:text-route-yellow"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex gap-5 pt-2">
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-route-yellow"
              >
                Instagram
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noreferrer"
                className="font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-route-yellow"
              >
                Facebook
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-dusk-grey/70">
            <Link to="/menu" className="transition-colors hover:text-route-yellow">
              Menu
            </Link>
            <Link to="/reserve" className="transition-colors hover:text-route-yellow">
              Reserve
            </Link>
            <Link to="/reviews" className="transition-colors hover:text-route-yellow">
              Reviews
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-route-yellow">
            Map
          </h3>
          <a
            href={site.maps}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block overflow-hidden rounded-[1.125rem] border border-[rgba(212,175,55,0.2)] transition-all duration-300 hover:border-route-yellow hover:shadow-[0_8px_28px_rgba(212,175,55,0.2)]"
          >
            <iframe
              title="Highway 10 location map"
              src="https://www.google.com/maps?q=Highway+10+Food+Court+Jamnagar+Khimliya&output=embed"
              className="pointer-events-none h-36 w-full opacity-90"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </a>
          <a
            href={site.maps}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-display text-xs font-semibold uppercase tracking-[0.14em] text-route-yellow transition-opacity hover:opacity-80"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
      <div className="border-t border-[rgba(212,175,55,0.15)] py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8 md:pl-20">
          <div className="font-body text-[11px] text-dusk-grey/70">
            © {new Date().getFullYear()} Highway 10 Food Court · Jamnagar, Gujarat
          </div>
          <Link to="/login" className="font-display text-[10px] font-semibold uppercase tracking-widest text-dusk-grey/50 hover:text-route-yellow transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
