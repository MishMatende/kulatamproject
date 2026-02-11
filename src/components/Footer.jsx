import { FiInstagram, FiPhone } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="max-w-6xl mx-auto pb-2 px-4 flex flex-col items-center gap-4 text-center">
        {/* Bolt Food Link */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--brand-bg-dark)" }}
          >
            Available on:
          </p>

          <a
            href="https://food.bolt.eu/en/p/188508-kt-cafe-restaurant/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition border rounded"
          >
            <img
              src="/Bolt.svg"
              alt="Bolt Food"
              className="w-15 h-15 object-contain"
            />
          </a>
        </div>

        <p style={{ color: "var(--brand-bg-dark)" }} className="text-sm">
          © {new Date().getFullYear()} KT Cafe. All rights reserved.
        </p>

        {/* <div className="flex gap-3">
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
        </div> */}
      </div>
    </footer>
  );
}
