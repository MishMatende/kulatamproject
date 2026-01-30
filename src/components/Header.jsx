import { Link } from "react-router-dom";
import { FiInstagram, FiPhone } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full relative z-20 bg-white shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src="/kulatam-logo.svg"
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{ color: "var(--brand-bg-dark)" }}
          >
            KT CAFE
          </h1>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3">
          <a
            href="https://www.instagram.com/kulatam_/"
            className="p-2 rounded-full border"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <FiInstagram size={16} />
          </a>
          <a
            href="https://www.tiktok.com/@kulatam_?_r=1&_t=ZS-93VgTSXig44"
            className="p-2 rounded-full border"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <FaTiktok size={16} />
          </a>
          <a
            href="tel:+254100931818"
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
