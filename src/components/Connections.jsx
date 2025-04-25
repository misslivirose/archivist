import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useConnections } from "../hooks/connectionManager";

const TimelineItem = ({ name, date, index }) => (
  <motion.div
    className="relative pl-10 pb-8 border-l-2 border-gray-300 w-full overflow-visible"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03, duration: 0.4 }}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-gray-800">{name}</span>
      <span className="text-sm text-gray-500">{date}</span>
    </div>
  </motion.div>
);

const Connections = () => {
  const { connections } = useConnections();
  const containerRef = useRef(null);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);

  const sortedConnections = Array.isArray(connections)
    ? [...connections].sort(
        (a, b) => new Date(a.added_date) - new Date(b.added_date),
      )
    : [];

  const connectionsByYear = sortedConnections.reduce((acc, connection) => {
    const year = new Date(connection.added_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(connection);
    return acc;
  }, {});

  const years = Object.keys(connectionsByYear).sort((a, b) => a - b);

  const scrollToYear = (index) => {
    const container = containerRef.current;
    if (container && container.children[index]) {
      container.children[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentYearIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Year Pages */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto h-full snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {years.map((year) => (
          <div
            key={year}
            className="flex-shrink-0 w-screen h-screen snap-center flex flex-col items-center justify-center p-8"
          >
            <h2 className="text-5xl font-bold mb-10 text-gray-700">{year}</h2>
            <div className="flex flex-col items-center space-y-6 overflow-y-auto w-2/3 max-h-[60vh]">
              {connectionsByYear[year].map((connection, index) => (
                <TimelineItem
                  key={`${connection.name}-${index}`}
                  name={connection.name}
                  date={connection.added_date}
                  index={index}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md">
        <button
          onClick={() => scrollToYear(Math.max(0, currentYearIndex - 1))}
          className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md text-xl"
        >
          ←
        </button>

        <div className="text-gray-700 font-medium text-lg">
          Year {currentYearIndex + 1} of {years.length}
        </div>

        <button
          onClick={() =>
            scrollToYear(Math.min(years.length - 1, currentYearIndex + 1))
          }
          className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md text-xl"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Connections;
