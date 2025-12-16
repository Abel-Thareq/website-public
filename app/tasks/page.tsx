"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Tasks() {
  const [isMobile, setIsMobile] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isOverText, setIsOverText] = useState(false);

  const tasks = [
    { id: 1, title: "Q3 Marketing Report", assignee: "Tom Wilson", priority: "High", status: "Pending Revision", deadline: "Today" },
    { id: 2, title: "Software Update Documentation", assignee: "Jane Smith", priority: "Medium", status: "In Progress", deadline: "Tomorrow" },
    { id: 3, title: "Client Presentation Deck", assignee: "Mike Brown", priority: "High", status: "Pending Revision", deadline: "2 days" },
    { id: 4, title: "API Integration Testing", assignee: "Sarah Chen", priority: "Low", status: "Completed", deadline: "Yesterday" },
  ];

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
                  <p className="text-sm text-gray-500">Task Management</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm">
                  <a href="/" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Dashboard</a>
                  <a href="/attendance" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Attendance</a>
                  <a href="/tasks" className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">Tasks</a>
                  <a href="/reports" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Reports</a>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Active Tasks</h2>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${task.priority === "High" ? "bg-red-100 text-red-800" : task.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 text-xs rounded-full ${task.status === "Completed" ? "bg-green-100 text-green-800" : task.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Assigned to: {task.assignee} • Deadline: {task.deadline}</p>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {task.status === "Completed" ? "View" : "Review"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}