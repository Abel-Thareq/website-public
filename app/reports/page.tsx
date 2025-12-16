"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Reports() {
  const [isMobile, setIsMobile] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isOverText, setIsOverText] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    if (typeof window !== "undefined") {
      checkMobile();
      const handleMouseMove = (e: MouseEvent) => {
        if (isMobile) return;
        setCursorPosition({ x: e.clientX, y: e.clientY });
        const target = e.target as HTMLElement;
        setIsOverText(["P","SPAN","H1","H2","H3","A","LI"].includes(target.tagName) || window.getComputedStyle(target).cursor === "text");
        setIsPointer(["A","BUTTON"].includes(target.tagName) || !!target.closest("a") || !!target.closest("button") || window.getComputedStyle(target).cursor === "pointer");
      };
      window.addEventListener("mousemove", handleMouseMove);
      if (!isMobile) document.body.style.cursor = "none";
      return () => { window.removeEventListener("mousemove", handleMouseMove); document.body.style.cursor = "auto"; };
    }
  }, [isMobile]);

  return (
    <>
      {!isMobile && (
        <div className="fixed pointer-events-none z-50 transition-all duration-75 ease-out"
          style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px`, transform: "translate(-50%, -50%)" }}>
          <div className={`absolute rounded-full transition-all duration-200 ease-out ${isPointer ? "scale-125" : "scale-100"} ${isOverText ? "bg-transparent" : "bg-blue-600/20"}`}
            style={{ width: isPointer ? "24px" : "20px", height: isPointer ? "24px" : "20px", border: isOverText ? "2px solid rgba(59, 130, 246, 0.5)" : "none" }} />
          <div className="absolute rounded-full" style={{ width: "4px", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.9)", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: isPointer ? "none" : "block" }} />
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <Image src="/logo TechMaven.png" alt="Logo" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TechMedia TechMaven Portal</h1>
                  <p className="text-sm text-gray-500">Performance Reports</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm">
                  <a href="/" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Dashboard</a>
                  <a href="/attendance" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Attendance</a>
                  <a href="/tasks" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Tasks</a>
                  <a href="/reports" className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">Reports</a>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Monthly Performance Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Average On-Time Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">87.5%</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Task Completion Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">92%</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Employee Satisfaction</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">89%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Highlights - December 2025</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3"><span className="text-green-600 mt-1">✓</span> Highest on-time attendance in Q4</li>
              <li className="flex items-start gap-3"><span className="text-green-600 mt-1">✓</span> 98% task completion by Engineering team</li>
              <li className="flex items-start gap-3"><span className="text-amber-600 mt-1">!</span> 12% increase in late arrivals compared to November</li>
              <li className="flex items-start gap-3"><span className="text-blue-600 mt-1">★</span> Sarah Chen named Employee of the Month</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}