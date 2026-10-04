'use client';
import { useLocale } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CircleFlag } from 'react-circle-flags';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { CheckIcon } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'gb',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: 'ae',
  },
];

interface LanguageDropdownProps {
  disabled?: boolean;
  slim?: boolean;
  locale?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  disabled,
  slim,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale(); //  Automatically updated from next int privider

  const [open, setOpen] = useState(false);

  const selectedLanguage = useMemo(() => {
    return LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0];
  }, [locale]);

  const pathSegments = useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname],
  );

  const handleLanguageChange = (language: Language) => {
    setOpen(false);

    const newPathSegments = [...pathSegments];
    if (newPathSegments[0] && newPathSegments[0].length === 2) {
      newPathSegments[0] = language.code;
    } else {
      newPathSegments.unshift(language.code);
    }

    router.push(`/${newPathSegments.join('/')}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        aria-label="Select Language"
        title="Change Language"
        className={cn(
          'flex items-center justify-between border-none rounded-md p-2 text-sm hover:bg-accent',
          slim && 'h-8 px-2',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <div className="flex items-center gap-2 min-w-[50px]">
          <CircleFlag
            countryCode={selectedLanguage.flag}
            height="20"
            width="20"
          />
          <span className="text-xs">{selectedLanguage.code.toUpperCase()}</span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[130px] p-0" align="end" sideOffset={5}>
        <Command>
          <CommandList>
            <CommandGroup>
              {LANGUAGES.map((language) => (
                <CommandItem
                  key={language.code}
                  value={language.code}
                  onSelect={() => handleLanguageChange(language)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CircleFlag
                      countryCode={language.flag}
                      height="20"
                      width="20"
                    />
                    <span>{language.name}</span>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
