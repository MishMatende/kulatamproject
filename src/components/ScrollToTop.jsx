import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  // PUSH | REPLACE | POP

  useEffect(() => {
    // ❌ Do nothing on swipe-back / browser back
    if (navigationType === "POP") return;

    // ✅ Only reset scroll on normal navigation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, navigationType]);

  return null;
}
