import { Link } from "react-router-dom";
import { FiInstagram, FiPhone } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Header() {
  return (
    <header
      className="w-full border-b"
      style={{
        backgroundColor: "var(--brand-bg-dark)",
        borderColor: "var(--brand-border)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left Logo + Title */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--brand-text-light)" }}
          >
            KT CAFE
          </h1>
        </div>

        {/* Categories Row */}
        <nav className="hidden md:flex gap-6">
          <Link
            className="text-sm hover:underline"
            style={{ color: "var(--brand-text-light)" }}
            to="/"
          >
            Menu
          </Link>
          <Link
            className="text-sm hover:underline"
            style={{ color: "var(--brand-text-light)" }}
            to="/"
          >
            About
          </Link>
          <Link
            className="text-sm hover:underline"
            style={{ color: "var(--brand-text-light)" }}
            to="/"
          >
            Contact
          </Link>
        </nav>

        {/* Social Icons */}
        <div className="flex gap-3">
          <a
            href="#"
            className="p-2 rounded-full border"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <FiInstagram size={16} />
          </a>
          <a
            href="#"
            className="p-2 rounded-full border"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <FaTiktok size={16} />
          </a>
          <a
            href="tel:+254700000000"
            className="p-2 rounded-full border"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <FiPhone size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
