import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import PosterModal from "../components/PosterModal";

export default function PublicLayout() {
  useEffect(() => {
    const interval = setInterval(() => {
      loadPosters();
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-6xl flex flex-col">
        <Header />
        <ScrollToTop />

        <PosterModal />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
