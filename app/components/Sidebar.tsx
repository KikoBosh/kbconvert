'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileImage, FileText, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [page, setPage] = useQueryState('page', { defaultValue: 'convert' });
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = async (newPage: string) => {
    await setPage(newPage);
    switch(newPage) {
      case 'convert':
        router.push('/image-converter');
        break;
      case 'ocr':
        router.push('/image-ocr');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className={cn("h-full flex flex-col justify-between", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Tools
          </h2>
          <div className="h-[1px] bg-border my-2" />
          <div className="space-y-1">
            <Button 
              variant={page === 'convert' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation('convert')}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Image Converter
            </Button>
            <Button 
              variant={page === 'ocr' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation('ocr')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Image to Text
            </Button>
            <Button 
              variant={page === 'settings' ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-auto px-3 py-2">
        {mounted && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
        )}
      </div>
    </div>
  );
} 