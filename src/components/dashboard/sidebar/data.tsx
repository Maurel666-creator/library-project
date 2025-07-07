import { FiHome, FiUsers, FiFileText, FiCalendar } from 'react-icons/fi';
import { FaClipboardList, FaHandHolding } from 'react-icons/fa';
import { MdQrCode2 } from 'react-icons/md';

export const data = [
  {
    title: 'Dashboard',
    link: '/dashboard',
    icon: <FiHome size={20} />,
  },
  {
    title: 'Auteurs',
    link: '/dashboard/authors',
    icon: <FiUsers size={20} />,
  },
  {
    title: 'Catégorie',
    link: '/dashboard/category',
    icon: <FiCalendar size={20} />,
  },
  {
    title: 'Livres',
    link: '/dashboard/books',
    icon: <FiFileText size={20} />,
  },
  {
    title: 'Générer un code QR',
    link: '/dashboard/qr-code',
    icon: <MdQrCode2 size={20} />,
  },
  {
    title: 'Liste de présences',
    link: '/dashboard/listPresence',
    icon: <FaClipboardList size={20} />,
  },
  {
    title: 'Gestion des emprunts',
    link: '/dashboard/loans',
    icon: <FaHandHolding size={20} />,
    submenu: [
      {
        title: 'Ajouter un nouvel emprunt',
        link: '/dashboard/loans/new'
      },
      {
        title: 'Marquer un livre rendu',
        link: '/dashboard/loans/return'
      },
      {
        title: 'Liste des emprunts',
        link: '/dashboard/loans/lists'
      }
    ]
  }
];