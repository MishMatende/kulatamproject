import { useEffect } from "react";

export default function LoadingScreen() {
  useEffect(() => {
    const img = new Image();
    img.src = "/kulatam-logo.svg";
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff", // Or use your brand background
      }}
    >
      <img
        src="/kulatam-logo.svg"
        alt="Loading"
        style={{
          height: "90px",
          width: "90px",
          animation: "spinInward 1s linear infinite",
          transformStyle: "preserve-3d",
        }}
      />
    </div>
  );
}
