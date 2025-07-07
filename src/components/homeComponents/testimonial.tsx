import React from 'react';
import Image from 'next/image';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
}

const testimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Jean Dupont',
        role: 'Étudiant en Informatique',
        content: 'Cette bibliothèque m\'a permis d\'accéder à des ressources essentielles pour mes études, gratuitement et facilement.',
        avatar: '/images/avatar-1.jpg'
    },
    {
        id: '2',
        name: 'Jean Dupont',
        role: 'Étudiant en Informatique',
        content: 'Cette bibliothèque m\'a permis d\'accéder à des ressources essentielles pour mes études, gratuitement et facilement.',
        avatar: '/images/avatar-1.jpg'
    },
    {
        id: '3',
        name: 'Jean Dupont',
        role: 'Étudiant en Informatique',
        content: 'Cette bibliothèque m\'a permis d\'accéder à des ressources essentielles pour mes études, gratuitement et facilement.',
        avatar: '/images/avatar-1.jpg'
    }
];

const Testimonials: React.FC = () => {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Témoignages d&apos;étudiants</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">{testimonial.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;