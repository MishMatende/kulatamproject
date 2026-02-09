import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }

    loadUser();
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-2xl bg-gradient-to-r from-[var(--brand-bg-dark)] to-gray-800 p-5 text-white shadow-md"
      >
        <h1 className="text-xl font-semibold">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </h1>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4"
      >
        {/* Categories */}
        <motion.div variants={cardVariants}>
          <Link
            to="/admin/categories"
            className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-200
                       active:scale-[0.97] transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                📂
              </div>
              <div>
                <h2 className="font-semibold">Categories</h2>
                <p className="text-sm text-gray-500">Manage menu categories</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Menu Items */}
        <motion.div variants={cardVariants}>
          <Link
            to="/admin/items"
            className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-200
                       active:scale-[0.97] transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                🍽️
              </div>
              <div>
                <h2 className="font-semibold">Menu Items</h2>
                <p className="text-sm text-gray-500">Add and edit menu items</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Posters */}
        <motion.div variants={cardVariants}>
          <Link
            to="/admin/posters"
            className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-200
                       active:scale-[0.97] transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                🖼️
              </div>
              <div>
                <h2 className="font-semibold">Poster</h2>
                <p className="text-sm text-gray-500">
                  Manage popup poster for clients
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
