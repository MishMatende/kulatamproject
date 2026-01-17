export default function MenuItemRow({ item, hasTriple }) {
  const { name, price, variants, description } = item;

  return (
    <div className="flex justify-between items-center py-2 border-b last:border-none">
      {/* LEFT SIDE */}
      <div className="flex flex-col max-w-[60%]">
        <span className="font-medium">{name}</span>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>

      {/* RIGHT SIDE */}
      {variants ? (
        <div className="flex gap-6 text-right whitespace-nowrap min-w-[40%] justify-end">
          <span>{variants.Single ?? ""}</span>
          <span>{variants.Double ?? ""}</span>
          {hasTriple && <span>{variants.Triple ?? ""}</span>}
        </div>
      ) : (
        <div className="min-w-[40%] text-right font-semibold">{price}</div>
      )}
    </div>
  );
}
