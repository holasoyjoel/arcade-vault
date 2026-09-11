"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function readUser(): { name: string } | null {
  try {
    return JSON.parse(localStorage.getItem("av_user") || "null");
  } catch {
    return null;
  }
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    setUser(readUser());
  }, [pathname]);

  const isBiblioteca = pathname === "/" || pathname.startsWith("/biblioteca") || pathname.startsWith("/juegos");
  const isSalon = pathname.startsWith("/salon");
  const isAuth = pathname.startsWith("/auth");

  const close = () => setOpen(false);

  const signOut = () => {
    try {
      localStorage.removeItem("av_user");
    } catch {
      // localStorage deshabilitado (modo privado/SSR) — la app sigue siendo usable sin persistencia
    }
    setUser(null);
  };

  return (
    <>
      <nav className="av-nav">
        <Link href="/biblioteca" className="logo">
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/biblioteca" className={isBiblioteca ? "active" : ""}>
            Biblioteca
          </Link>
          <Link href="/salon" className={isSalon ? "active" : ""}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className={"btn auth-btn" + (isAuth ? " active" : "")}>
            Iniciar Sesión
          </Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/biblioteca" className={isBiblioteca ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={isSalon ? "active" : ""} onClick={close}>
          Salón de la Fama
        </Link>
        {user ? (
          <a className={isAuth ? "active" : ""} onClick={() => { signOut(); close(); }}>
            Cerrar sesión ({user.name})
          </a>
        ) : (
          <Link href="/auth" className={isAuth ? "active" : ""} onClick={close}>
            Iniciar Sesión
          </Link>
        )}
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
