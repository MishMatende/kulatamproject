export default function MenuItemRow({ item, hasTriple }) {
  const { name, price, variants, description } = item;

  let single = variants?.Single;
  let double = variants?.Double;
  let triple = variants?.Triple;

  // If item has variants but only ONE price, treat as Single
  if (variants) {
    const values = Object.entries(variants)
      .map(([k, v]) => v)
      .filter((v) => v !== null && v !== undefined);

    if (!single && values.length === 1) {
      single = values[0];
    }
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
      {variants ? (
        <div className="brand-light brand-border flex gap-6 text-right whitespace-nowrap min-w-[40%] justify-end text-sm">
          <span>{single ?? ""}</span>
          <span>{double ?? ""}</span>
          {hasTriple && <span>{triple ?? ""}</span>}
        </div>
      ) : (
        <div className="min-w-[40%] text-right font-medium text-sm">
          {price}
        </div>
      )}
    </div>
  );
}
