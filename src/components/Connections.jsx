import React from "react";
import { motion } from "framer-motion";
import { useConnections } from "../hooks/connectionManager";

const getColorForYear = (year) => {
  if (year < 2010) return "bg-purple-500";
  if (year < 2015) return "bg-green-500";
  if (year < 2020) return "bg-blue-500";
  return "bg-pink-500";
};

const TimelineItem = ({ name, date, index }) => (
  <motion.div
    className="relative pl-10 pb-8 border-l-2 border-gray-300"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
  >
    <motion.div
      className={`absolute left-[-10px] top-0 ${getColorForYear(new Date(date).getFullYear())} h-4 w-4 rounded-full border-2 border-white shadow`}
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
    <div className="flex flex-col">
      <span className="font-semibold text-gray-800">{name}</span>
      <span className="text-sm text-gray-500">{date}</span>
    </div>
  </motion.div>
);

const Connections = () => {
  // Sort by date ascending
  const connections = useConnections().connections;
  console.log("🧪 connections raw:", connections);

  const sortedConnections = Array.isArray(connections)
    ? [...connections].sort(
        (a, b) => new Date(a.added_date) - new Date(b.added_date),
      )
    : [];

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Friendship Timeline
      </h2>
      <div className="space-y-6">
        {sortedConnections.map((connection, index) => (
          <TimelineItem
            key={`${connection.name}-${index}`}
            name={connection.name}
            date={connection.added_date}
          />
        ))}
      </div>
    </div>
  );
};

export default Connections;
