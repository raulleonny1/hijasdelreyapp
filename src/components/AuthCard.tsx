import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-cream to-white">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Image
            src="/logo.jpeg"
            alt="La Orden de las Hijas del Rey"
            width={72}
            height={72}
            className="mx-auto rounded-full ring-2 ring-gold/40 mb-4"
          />
          <p className="mb-2 text-xs font-semibold tracking-wider text-gold uppercase">
            La Orden de las Hijas del Rey
          </p>
          <h1 className="font-serif text-3xl text-navy">{title}</h1>
          <p className="mt-2 text-navy/60">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-8 shadow-lg">
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-navy hover:text-gold transition">
      {children}
    </Link>
  );
}
