import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";

export default function YourBreakfast() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const STORAGE_KEY = "build_your_own_selection";

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.price), 0);

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    navigate("/build-your-own");
  }

  return (
    <div className="p-6 space-y-5 min-h-[90vh] pb-24">
      <BackButton />

      {/* 🔥 Info Banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: "rgba(156, 94, 0, 0.08)",
          border: "1px solid rgba(156, 94, 0, 0.2)",
          color: "var(--brand-primary)",
        }}
      >
        <p className="font-medium">Here’s your custom breakfast 🍳</p>
        <p className="text-xs opacity-80">
          Show this to your waiter when you're ready.
        </p>
      </div>

      <h1
        className="text-2xl font-bold text-center"
        style={{ color: "var(--brand-primary)" }}
      >
        Your Breakfast
      </h1>

      {/* 🔥 EMPTY STATE */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
          <p className="text-gray-500">No items selected.</p>

          <button
            onClick={() => navigate("/build-your-own")}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Start Building →
          </button>
        </div>
      ) : (
        <>
          {/* 🔥 ITEMS */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl px-4 py-3 flex justify-between items-center"
                style={{
                  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                }}
              >
                <span className="font-medium text-sm">{item.name}</span>

                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--brand-primary)" }}
                >
                  KES {item.price}
                </span>
              </div>
            ))}
          </div>

          {/* 🔥 STICKY TOTAL BAR */}
          <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
            <div className="w-full max-w-6xl backdrop-blur bg-white/95 border shadow-xl rounded-2xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{items.length} item(s)</p>
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--brand-primary)" }}
                >
                  KES {total.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="px-5 py-2.5 rounded-xl border text-red-600 border-red-300 font-semibold active:scale-95 transition"
              >
                Start Over
              </button>
            </div>
          </div>
        </>
      )}

      {/* 🔥 CONFIRM MODAL */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full sm:max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-red-600">Start Over?</h2>

            <p className="text-sm text-gray-600">
              This will clear your breakfast selection. Are you sure?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl bg-gray-100 py-2"
              >
                Cancel
              </button>

              <button
                onClick={clear}
                className="flex-1 rounded-xl bg-red-600 text-white py-2"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
