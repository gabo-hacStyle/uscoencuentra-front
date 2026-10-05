import Link from "next/link";
import { IconShield } from "@/components/ui/icons";

// TODO: confirm the help route with the team
const HELP_PATH = "/ayuda";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-usco-line">
      {/* Stacked and centered on mobile, one row on md+ */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-usco-muted md:flex-row md:justify-between md:px-6 md:text-left">
        <p>USCO Encuentra · Prototipo académico de Ingeniería de Software</p>

        <div className="flex items-center gap-6">
          <p className="flex items-center gap-2">
            <IconShield className="h-4 w-4 shrink-0 text-usco-wine" />
            Tus datos están protegidos
          </p>
          <Link href={HELP_PATH} className="transition hover:text-usco-ink">
            Ayuda
          </Link>
        </div>
      </div>
    </footer>
  );
}