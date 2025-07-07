import { useState, useEffect } from 'react';

type Category = {
  id: number;
  nom: string;
};

export default function BookSearchBar({
  onSearch,
  onCategoryChange,
  onAvailableChange,
}: {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onAvailableChange: (availableOnly: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/category');
        if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCategories();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAvailableChange(e.target.checked);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Rechercher un livre..."
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={query}
        onChange={handleSearchChange}
      />
      <select
        className="px-4 py-2 border rounded shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id.toString()}>
            {cat.nom}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" className="form-checkbox" onChange={handleCheckboxChange} /> Disponible seulement
      </label>
    </div>
  );
}
