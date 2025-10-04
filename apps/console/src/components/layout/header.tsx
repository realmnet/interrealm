import React from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  onMenuToggle: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, theme = 'light', onThemeToggle }) => {
  const { logout, isAuthEnabled } = useAuth();

  return (
    <header className="h-16 border-b border-header-border bg-gradient-to-r from-header-bg to-background px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
              <path
                d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Realm Mesh
            </span>
            <span className="text-sm text-muted-foreground font-medium">Console</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {isAuthEnabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="rounded-full"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
};