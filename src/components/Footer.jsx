export default function Footer() {
  const googleReviewLink = "https://g.page/r/CXdP1Et3gXTPEBM/review"; // replace

  return (
    <footer className="relative w-full mt-10 bg-gradient-to-br from-white via-gray-50 to-white border-t">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ⭐ Review Link */}
        <div className="flex justify-center">
          <a
            href={googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition hover:scale-105"
            style={{
              color: "var(--brand-primary)",
              background: "rgba(0,0,0,0.04)",
            }}
          >
            ⭐ Leave us a Google Review
          </a>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-2 gap-8 items-center">
          {/* Order Online - LEFT */}
          <div className="space-y-3">
            <p
              className="text-sm font-medium text-center"
              style={{ color: "var(--brand-bg-dark)" }}
            >
              Order Online:
            </p>

            <div className="flex justify-center">
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
                className="group inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-95"
                style={{
                  background: "var(--brand-primary)",
                  color: "white",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                }}
              >
                {/* White logo container */}
                <span className="bg-white rounded-md">
                  <img
                    src="/Bolt.svg"
                    alt="Bolt Food"
                    className="w-7 h-7 object-contain"
                  />
                </span>
                Order on Bolt
              </button>
            </div>
          </div>

          {/* Brand + Location - RIGHT (LEFT ALIGNED TEXT) */}
          <div className="space-y-2 text-left">
            <h2
              className="text-xl font-semibold tracking-wide"
              style={{ color: "var(--brand-bg-dark)" }}
            >
              KT CAFE
            </h2>

            <p className="text-sm text-gray-500">Fresh | Cozy | Crafted.</p>

            <p className="text-sm text-gray-500">Chuna Mall, Kitengela</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} KT Cafe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
