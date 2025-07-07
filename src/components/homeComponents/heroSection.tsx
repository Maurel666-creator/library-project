import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-[500px] w-full">
      {/* Image d'arrière-plan */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-hero.jpg"
          alt="Bibliothèque avec étudiants"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      
      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Explorez. Lisez. Apprenez.
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl">
          Découvrez les livres disponibles dans notre bibliothèque.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/livres" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-300">
              📚 Voir les livres disponibles
          </Link>
          
          <Link href="/scanner" className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-300">
              📷 Marquer ma présence
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;