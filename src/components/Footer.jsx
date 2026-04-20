export default function Footer() {
  const googleReviewLink = "https://g.page/r/CXdP1Et3gXTPEBM/review"; // replace

  return (
    <footer className="relative w-full mt-5 bg-linear-to-br from-white via-gray-50 to-white border-t">
      <div className="max-w-6xl mx-auto px-6 pb-8 pt-4 space-y-8">
        {/* ⭐ Review Link */}
        <div
          className="flex flex-col items-center gap-3 py-4 px-6 rounded-xl mx-auto mb-6 max-w-2xl text-center"
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <p className="text-sm md:text-base">
            ⭐ Enjoyed your experience at{" "}
            <span className="font-semibold">KT Café</span>? Your feedback helps
            us grow.
          </p>

          <a
            href={googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition hover:scale-105"
            style={{
              color: "var(--brand-primary)",
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            Leave us a Google Review
          </a>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-2 gap-8 items-center">
          {/* Order Online - LEFT */}
          <div className="space-y-3">
            <p
              className="text-sm font-semibold text-center"
              style={{ color: "var(--brand-bg-dark)" }}
            >
              Order Online:
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              {/* Bolt Food */}
              <a
                href="https://food.bolt.eu/en/320-nairobi/p/188508-kt-cafe-restaurant/?utm_source=google_integration&utm_medium=website&utm_campaign=footer_cta"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-95"
                style={{
                  background: "var(--brand-primary)",
                  color: "white",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                }}
              >
                <span className="bg-white rounded-md p-1">
                  <img
                    src="/Bolt.svg"
                    alt="Bolt Food"
                    className="w-8 h-7 object-contain"
                  />
                </span>
                Order on Bolt
              </a>

              {/* Uber Eats */}
              <a
                href="https://www.ubereats.com/ke/store/kt-cafe/GNr0rPcgW4mIjM9-1wGqDQ?diningMode=PICKUP&mod=merchantUnavailable&modctx=%257B%2522storeUuid%2522%253A%252218daf4ac-f720-5b89-888c-cf7ed701aa0d%2522%257D&ps=1&sc=SEARCH_SUGGESTION" // replace with your actual restaurant link
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-95"
                style={{
                  background: "#06c16a",
                  color: "white",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                }}
              >
                <span className="bg-white rounded-md p-1">
                  <img
                    src="/uber-eats.jpeg"
                    alt="Uber Eats"
                    className="w-12 h-7 object-contain"
                  />
                </span>
                Order on Uber Eats
              </a>
            </div>
          </div>

          {/* Brand + Location - RIGHT (LEFT ALIGNED TEXT) */}
          <div className="space-y-2 text-left md:text-center">
            <h2
              className="text-xl font-bold tracking-wide"
              style={{ color: "var(--brand-bg-dark)" }}
            >
              KT CAFE
            </h2>

            <p className="text-sm text-gray-500 font-semibold">
              Fresh |{" "}
              <span style={{ color: "var(--brand-primary)" }}>Cozy</span> |
              Crafted.
            </p>

            <p className="text-sm text-gray-500 font-semibold">
              Chuna Mall, Kitengela
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-4 text-center text-sm text-gray-500 font-semibold">
          <span style={{ color: "var(--brand-primary)" }}>
            © {new Date().getFullYear()} KT Cafe.
          </span>{" "}
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
