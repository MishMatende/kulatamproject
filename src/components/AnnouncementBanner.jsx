import { useEffect, useState } from "react";

export default function AnnouncementBanner({ googleReviewLink }) {
  const [visible, setVisible] = useState(true);
  const [render, setRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const removeTimer = setTimeout(() => {
        setRender(false);
      }, 600);

      return () => clearTimeout(removeTimer);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <div
      className={`announcement-bar transition-all duration-800 ${
        visible ? "opacity-100 max-h-20 py-2" : "opacity-0 max-h-0 py-0"
      }`}
    >
      <div className="announcement-track">
        <span>
          ⭐⭐⭐⭐⭐ Enjoying the food and atmosphere at KT Café?
          <a
            href={googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-link"
          >
            Share your experience →
          </a>
        </span>

        <span>
          ⭐⭐⭐⭐⭐ Enjoying the food and atmosphere at KT Café?
          <a
            href={googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-link"
          >
            Share your experience →
          </a>
        </span>
      </div>
    </div>
  );
}
