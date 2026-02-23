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

          <button
            onClick={() => {
              const boltAppLink = "boltfood://restaurant/188508";
              const fallbackLink =
                "https://food.bolt.eu/en/p/188508-kt-cafe-restaurant/";

              window.location.href = boltAppLink;

              setTimeout(() => {
                window.location.href = fallbackLink;
              }, 1500);
            }}
            className="hover:opacity-80 transition border rounded-lg"
          >
            <img
              src="/Bolt.svg"
              alt="Bolt Food"
              className="w-[60px] h-[60px] object-contain"
            />
          </button>
        </div>

        <p style={{ color: "var(--brand-bg-dark)" }} className="text-sm">
          © {new Date().getFullYear()} KT Cafe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
