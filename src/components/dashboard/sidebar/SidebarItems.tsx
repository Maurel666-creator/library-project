import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { data } from './data';
import { useDashboardContext } from '../Provider';
import { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const style = {
  title: 'mx-4 text-sm whitespace-pre',
  active: 'bg-blue-100 text-blue-600 rounded-full',
  link: 'flex items-center justify-start my-1 p-3 w-full hover:text-blue-600',
  close: 'lg:duration-700 lg:ease-out lg:invisible lg:opacity-0 lg:transition-all',
  open: 'lg:duration-500 lg:ease-in lg:h-auto lg:opacity-100 lg:transition-all lg:w-auto',
  submenu: 'ml-6 border-l-2 border-gray-200',
  submenuItem: 'py-2 px-4 hover:text-blue-600',
  submenuActive: 'text-blue-600 font-medium',
  nonClickable: 'cursor-default',
};

export function SidebarItems() {
  const pathname = usePathname();
  const { isOpen } = useDashboardContext();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <ul className="md:pl-3">
      {data.map((item) => (
        <li key={item.title}>
          <div className="flex flex-col">
            {item.submenu ? (
              // Item avec sous-menu (non cliquable)
              <div className={`${style.link} ${style.nonClickable}`}>
                <div className={`p-2 ${pathname.startsWith(item.link) ? style.active : ''}`}>
                  <span>{item.icon}</span>
                </div>
                <span className={`${style.title} ${isOpen ? style.open : style.close}`}>
                  {item.title}
                </span>
                {isOpen && (
                  <button 
                    onClick={() => toggleSubmenu(item.title)}
                    className="ml-auto focus:outline-none"
                  >
                    {openSubmenus[item.title] ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                  </button>
                )}
              </div>
            ) : (
              // Item sans sous-menu (cliquable)
              <Link href={item.link}>
                <span className={style.link}>
                  <div className={`p-2 ${item.link === pathname ? style.active : ''}`}>
                    <span>{item.icon}</span>
                  </div>
                  <span className={`${style.title} ${isOpen ? style.open : style.close}`}>
                    {item.title}
                  </span>
                </span>
              </Link>
            )}
            
            {item.submenu && isOpen && openSubmenus[item.title] && (
              <div className={style.submenu}>
                {item.submenu.map((subItem) => (
                  <Link key={subItem.title} href={subItem.link}>
                    <div className={`${style.submenuItem} ${pathname === subItem.link ? style.submenuActive : ''}`}>
                      {subItem.title}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

