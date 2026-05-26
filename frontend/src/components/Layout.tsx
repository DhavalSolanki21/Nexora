import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import NexoraLogo from "./NexoraLogo";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-nexora-bg">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-nexora-border bg-white/95 backdrop-blur-md">
        <motion.div
          className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-2 group text-nexora-dark hover:text-nexora-accent transition-colors">
            <NexoraLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-nexora-dark/60">
            <Link to="/datasets" className="hover:text-nexora-accent transition-colors">
              History
            </Link>
            {isHome && (
              <>
                <a href="#how-it-works" className="hover:text-nexora-accent transition-colors">
                  How It Works
                </a>
                <a href="#features" className="hover:text-nexora-accent transition-colors">
                  Features
                </a>
                <a href="#upload" className="hover:text-nexora-accent transition-colors">
                  Upload
                </a>
              </>
            )}
          </nav>

          <Link to="/" className="btn-ghost text-sm">
            New dataset
          </Link>
        </motion.div>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="border-t border-nexora-border py-8 text-center text-sm text-nexora-dark/40">
        <div className="flex items-center justify-center gap-2 mb-1">
          <NexoraLogo size="sm" className="text-nexora-accent/50" />
        </div>
        <p>Autonomous AI Predictive Analytics Platform</p>
      </footer>
    </div>
  );
}
