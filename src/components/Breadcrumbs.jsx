import { Link, useParams } from "react-router-dom";

export default function Breadcrumbs({ categoryName, subcategoryName }) {
  const { categoryId } = useParams();

  return (
    <nav className="text-sm mb-2 brand-light hover:text-brand-accent">
      <Link to="/" className="brand-dark">
        Menu
      </Link>
      {categoryName && (
        <>
          <span> / </span>
          <Link
            to={`/menu/${categoryId}`}
            className="brand-dark hover:text-brand-accent"
          >
            {categoryName}
          </Link>
        </>
      )}
      {subcategoryName && (
        <>
          <span> / </span>
          <span className="brand-dark hover:brand-accent">
            {subcategoryName}
          </span>
        </>
      )}
    </nav>
  );
}
