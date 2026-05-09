'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/buyers', label: 'Buyers', icon: '💰' },
  { href: '/deals', label: 'Deals', icon: '🏠' },
  { href: '/campaigns', label: 'Campaigns', icon: '📣' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="font-bold text-sm text-white leading-tight">Good Faith</div>
        <div className="text-xs text-gray-400">Property Group</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700 flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <div className="text-xs text-gray-400 truncate">Account</div>
      </div>
    </aside>
  );
}
