export default function MenuItemRow({ item, variantKeys }) {
  const { name, price, variants, description } = item;

  const displayVariants = {};

  if (variants && typeof variants === "object") {
    variantKeys.forEach((key) => {
      if (variants[key] !== undefined && variants[key] !== null) {
        displayVariants[key] = variants[key];
      }
    });
  } else if (variantKeys.length > 0) {
    // No variants -> put base price in first column
    displayVariants[variantKeys[0]] = price;
  }

  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0">
      {/* LEFT */}
      <div className="flex flex-col max-w-[60%]">
        <span className="text-sm">{name}</span>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>

      {/* RIGHT */}
      <div className="brand-light brand-border flex gap-6 text-right whitespace-nowrap min-w-[40%] justify-end text-sm">
        {variantKeys.length > 0 ? (
          variantKeys.map((key) => (
            <span key={key} className="tabular-nums">
              {displayVariants[key] ?? ""}
            </span>
          ))
        ) : (
          <span className="min-w-[40%] text-right font-medium text-sm">
            {price}
          </span>
        )}
      </div>
    </div>
  );
}
