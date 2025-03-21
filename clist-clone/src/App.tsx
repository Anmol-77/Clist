import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { ContestTable } from "@/components/contest-table";
import { ViewToggle } from "@/components/view-toggle";

function App() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {currentTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <ViewToggle
            activeView={viewMode}
            onViewChange={(view) => setViewMode(view as 'list' | 'calendar')}
          />
        </div>
        <ContestTable />
      </main>
      <footer className="container mx-auto px-4 py-4 flex items-center justify-center gap-4 text-gray-500 text-sm">
        <a href="https://github.com/aropan/clist" className="hover:text-gray-700">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <a href="https://t.me/s/clistbynews" className="hover:text-gray-700">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.55 6.62a2.24 2.24 0 0 0-.163 3.94l3.992 2.027c.271.135.591.163.879.075l7.32-2.245-5.997 5.997c-.54.54-.54 1.418 0 1.958l1.958 1.958c.54.54 1.418.54 1.958 0l5.997-5.997-2.245 7.32c-.088.289-.06.608.075.879l2.027 3.992a2.24 2.24 0 0 0 3.94-.163l6.62-16.55a2.242 2.242 0 0 0-1.476-3.031c-.18-.06-.362-.09-.543-.09z" />
          </svg>
        </a>
        <a href="https://discord.gg/n8VxASFbfh" className="hover:text-gray-700">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0-6-4-9-9-9s-9 3-9 9v1l-3 5h6v-2s.93.5 3 .5 3-.5 3-.5v2h6l-3-5z" />
            <path d="M7 16.5c.5 1 2 2 4 2s3.5-1 4-2" />
          </svg>
        </a>
        <a href="https://facebook.com/clistby" className="hover:text-gray-700">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
        <a href="https://twitter.com/clistby" className="hover:text-gray-700">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </svg>
        </a>
        <span className="mx-2">•</span>
        <a href="/api/v4/doc/" className="hover:text-gray-700">API</a>
        <span className="mx-2">•</span>
        <a href="/privacy-policy/" className="hover:text-gray-700">Privacy Policy</a>
        <span className="mx-2">•</span>
        <span>© 2012 Aleksey Ropan</span>
      </footer>
    </div>
  );
}

export default App;
