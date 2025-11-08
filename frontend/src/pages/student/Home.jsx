import React, { useState } from 'react';
import { Menu, X, Home, Calendar, History, BarChart2, Brain, User } from 'lucide-react';

export default function HomeS() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-200">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-xl font-semibold">AI Quiz Maker</h1>
        <button className="p-2 rounded-full hover:bg-gray-200">
          <User size={22} />
        </button>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white w-56 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <ul className="p-4 space-y-3">
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><Home size={18}/> Home</li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><Calendar size={18}/> Next Quizzes</li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><History size={18}/> History</li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><BarChart2 size={18}/> Analysis</li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><Brain size={18}/> Practice Quiz</li>
        </ul>
      </aside>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="p-6 md:p-10 space-y-10">
        {/* Home Summary Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Quizzes Attempted', value: '12' },
              { title: 'Average Score', value: '78%' },
              { title: 'Next Quiz', value: 'AI Basics – Oct 18' },
              { title: 'Accuracy', value: '85%' },
            ].map((card, i) => (
              <div key={i} className="bg-white shadow rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Quizzes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Next Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold">Upcoming Quiz {i}</p>
                <p className="text-sm text-gray-500">Scheduled: Date & Time</p>
                <button className="mt-3 bg-blue-600 text-white text-sm px-3 py-1 rounded-md">View Details</button>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section>
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <p>Quiz {i}</p>
                <button className="text-blue-600 text-sm font-medium">View Analysis</button>
              </div>
            ))}
          </div>
        </section>

        {/* Analysis */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Analysis</h2>
          <div className="bg-white rounded-xl shadow h-48 flex items-center justify-center text-gray-400">
            [ Chart / Performance Graph Placeholder ]
          </div>
        </section>

        {/* Practice Quiz */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Practice Quiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold">Practice Topic {i}</p>
                <button className="mt-3 bg-green-600 text-white text-sm px-3 py-1 rounded-md">Start Practice</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
