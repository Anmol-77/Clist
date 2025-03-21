import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0">
              <div className="flex items-center">
                <span className="text-blue-600 font-bold text-3xl">
                  <span className="text-blue-800">&#x25B2;</span>
                </span>
                <span className="ml-2 text-gray-500 font-light text-2xl">CLIST</span>
              </div>
            </a>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {/* <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    News
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a> */}
                </div>
                {/* <a href="/resources/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Resources
                </a>
                <a href="/standings/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Standings
                </a>
                <a href="/problems/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Problems
                </a>
                <a href="/coders/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Coders
                </a>
                <a href="/accounts/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Accounts
                </a>
                <a href="/donate/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Donate
                </a> */}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <a href="/login/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Log in / Sign up
              </a>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            News
          </a>
          <a href="/resources/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Resources
          </a>
          <a href="/standings/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Standings
          </a>
          <a href="/problems/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Problems
          </a>
          <a href="/coders/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Coders
          </a>
          <a href="/accounts/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Accounts
          </a>
          <a href="/donate/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Donate
          </a>
          <a href="/login/" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
            Log in / Sign up
          </a>
        </div>
      </div>
    </nav>
  );
}
