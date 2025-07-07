'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu as Menu, FiX as X } from 'react-icons/fi';
import '../styles/header.css';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header className="sticky top-8 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-blue-800">
                    <span className="text-blue-600">ENEAM</span>
                </Link>

                {/* Menu desktop */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <Link href="/" className="text-gray-700 hover:text-blue-600">Accueil</Link>
                    <Link href="/books" className="text-gray-700 hover:text-blue-600">Livres</Link>
                    <Link href="/scan" className="text-gray-700 hover:text-blue-600">Marquer ma présence</Link>
                    <Link href="/inscription" className="text-gray-700 hover:text-blue-600">Inscription</Link>
                    <Link href="/login" className="ml-4 px-4 py-1 border rounded text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white">
                        Connexion
                    </Link>
                </nav>

                {/* Menu mobile */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className='text-black md-hidden focus:outline-none'>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Menu mobile (drop-down) */}
            {isOpen && (
                <div className={`menu-mobile ${isOpen ? 'open' : ''} md:hidden px-4 pb-4 bg-white shadow`}>
                    <Link href="/" className="block py-1 text-gray-700 hover:text-blue-600">Accueil</Link>
                    <Link href="/books" className="block py-1 text-gray-700 hover:text-blue-600">Livres</Link>
                    <Link href="/scan" className="block py-1 text-gray-700 hover:text-blue-600">Marquer ma présence</Link>
                    <Link href="/inscription" className="block py-1 text-gray-700 hover:text-blue-600">Inscription</Link>
                    <Link href="/login" className="block mt-2 px-4 py-1 text-center border border-blue-700 text-blue-700 rounded hover:bg-blue-700 hover:text-white">
                        Connexion
                    </Link>
                </div>

            )}
        </header>
    );
}