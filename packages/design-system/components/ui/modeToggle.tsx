'use client';

import React, { useState } from 'react';
import { Moon, Sun, Computer } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@repo/design-system/components/ui/popover';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);

  const modes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Computer },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-40 p-2" align="end" sideOffset={5}>
        <div className="flex flex-col gap-1">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              aria-pressed={theme === value}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                theme === value &&
                  'bg-accent text-accent-foreground font-medium',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
