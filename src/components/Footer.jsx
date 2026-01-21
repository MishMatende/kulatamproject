import { FiInstagram, FiPhone } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="w-full shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]"
      // style={{ backgroundColor: "var(--brand-bg-light)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center gap-4 text-center">
        <p style={{ color: "var(--brand-bg-dark)" }} className="text-sm">
          © {new Date().getFullYear()} KT Cafe. All rights reserved.
        </p>

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
    </footer>
  );
}
