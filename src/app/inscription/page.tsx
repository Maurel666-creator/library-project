'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Filiere {
  id: number;
  nom: string;
}

interface Niveau {
  id: number;
  nom: string;
}

export default function InscriptionEtudiant() {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    email: '',
    telephone: '',
    filiereId: '',
    niveauId: '',
  });


  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filieresRes, niveauxRes] = await Promise.all([
          fetch('/api/filiere'),
          fetch('/api/niveau'),
        ]);
        const filiereData = await filieresRes.json();
        const niveauData = await niveauxRes.json();

        setFilieres(filiereData);
        setNiveaux(niveauData);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^0[1-9](\s?\d{2}){4}$/.test(phone);// Bénin ou France simplifié


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { nom, prenom, email, telephone, matricule, filiereId, niveauId } = form;

    if (!nom || !prenom || !email || !telephone || !matricule || !filiereId || !niveauId) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (!validateEmail(email)) {
      setError("L\'adresse e-mail n\'est pas valide.");
      return;
    }

    if (!validatePhone(telephone)) {
      setError("Le numéro de téléphone n\'est pas valide (ex: +229XXXXXXXX ou 0102030405).");
      return;
    }

    const payload = {
      nom,
      prenom,
      email,
      telephone,
      matricule,
      filiereId: parseInt(filiereId),
      niveauId: parseInt(niveauId),
      role: 'STUDENT', // Champ role caché
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Échec de l\'enregistrement');
      }

      setSuccess("Étudiant inscrit avec succès !");
      setForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        matricule: '',
        filiereId: '',
        niveauId: '',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white shadow-xl rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">Inscription d&apos;un étudiant</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NOM */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nom</label>
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Ex: Dupont"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800"
          />
        </div>

        {/* PRENOM */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Prénom</label>
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Ex: Jean"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Ex: jean.dupont@email.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800"
          />
        </div>

        {/* TELEPHONE */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            placeholder="Ex: 01 90 00 00 00"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500, placeholder:text-gray-500 text-gray-800"
          />
        </div>

        {/* MATRICULE */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Matricule</label>
          <input
            name="matricule"
            value={form.matricule}
            onChange={handleChange}
            placeholder="Ex: ETS12345"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500, placeholder:text-gray-500 text-gray-800"
          />
        </div>

        {/* FILIERE */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filière</label>
          <select
            name="filiereId"
            value={form.filiereId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500, text-gray-800"
          >
            <option value="">-- Choisir une filière --</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </select>
        </div>

        {/* NIVEAU */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Niveau</label>
          <select
            name="niveauId"
            value={form.niveauId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500, text-gray-800"
          >
            <option value="">-- Choisir un niveau --</option>
            {niveaux.map((niveau) => (
              <option key={niveau.id} value={niveau.id}>
                {niveau.nom}
              </option>
            ))}
          </select>
        </div>

        {/* BOUTON */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            {loading ? "En cours..." : "Inscription"}
          </button>
        </div>

        {/* MESSAGES */}
        {success && (
          <div className="md:col-span-2 text-green-600 text-sm text-center mt-2">{success}</div>
        )}
        {error && (
          <div className="md:col-span-2 text-red-600 text-sm text-center mt-2">{error}</div>
        )}
      </form>
    </div>
  );
}
