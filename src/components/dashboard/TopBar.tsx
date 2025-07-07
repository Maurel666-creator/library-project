'use client';

import { useDashboardContext } from './Provider';
import Image from 'next/image';
import { FiMenu, FiSearch, FiLogOut } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';


export function TopBar() {
  const { openSidebar } = useDashboardContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Assurez-vous d'envoyer les cookies
    });
    if (response.ok) {
      // Rediriger vers la page de connexion ou faire une action après la déconnexion
      window.location.href = '/login';
    }
  };


  return (
    <header className="relative z-10 h-20 items-center bg-white border-b border-gray-200">
      <div className="relative z-10 mx-auto flex h-full flex-col justify-center px-3">
        <div className="relative flex w-full items-center pl-1 sm:ml-0 sm:pr-2">
          <div className="group relative flex h-full w-12 items-center">
            <button
              type="button"
              aria-expanded="false"
              aria-label="Toggle sidenav"
              onClick={openSidebar}
              className="text-4xl text-gray-600 focus:outline-none ml-1"
            >
              <FiMenu size={24} />
            </button>
          </div>
          <div className="container relative left-0 flex w-3/4">
            <div className="group relative ml-8 hidden w-full items-center md:flex lg:w-72">
              <div className="absolute flex h-10 w-auto cursor-pointer items-center justify-center p-3 pr-2 text-sm uppercase text-gray-500 sm:hidden">
                <FiSearch size={20} />
              </div>
              <FiSearch
                className="pointer-events-none absolute left-0 ml-4 hidden h-4 w-4 text-gray-400 group-hover:text-gray-600 sm:block"
                size={16}
              />
              <input
                type="text"
                className="block w-full rounded-2xl bg-gray-100 border border-gray-300 py-1.5 pl-10 pr-4 leading-normal text-gray-700 placeholder:text-gray-400 opacity-90 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search"
              />
            </div>
          </div>
          <div className="relative ml-5 flex w-full items-center justify-end p-1 sm:right-auto sm:mr-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none"
              >
                <Image
                  alt="Maurice Lokumba"
                  src="/images/user.jpg"
                  width={40}
                  height={40}
                  className="mx-auto h-10 w-10 rounded-full object-cover border border-gray-200"
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiLogOut className="mr-2" size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}