import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="
        text-brand font-semibold text-sm brand-primary cursor-pointer
      "
    >
      ← Back
    </button>
  );
}

export default BackButton;
