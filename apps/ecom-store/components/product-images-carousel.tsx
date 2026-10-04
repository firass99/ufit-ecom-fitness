// components/ProductImagesCarousel.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';

export function ProductImagesCarousel({
  images = [],
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  if (!images.length)
    return (
      <Image
        src="https://ui.shadcn.com/placeholder.svg?text=No+Image"
        alt="No image"
        width={200}
        height={200}
        className="object-cover"
      />
    );

  return (
    <div>
      <div className="relative h-[400px] w-full rounded-xl border overflow-hidden bg-muted">
        <Image
          src={images[active]}
          alt={alt}
          fill
          className="object-cover transition-all duration-300"
          priority
        />
      </div>
      <div className="flex gap-2 mt-4 justify-center">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-14 h-14 border rounded-md overflow-hidden ${
              active === i ? 'ring-2 ring-primary' : ''
            }`}
            type="button"
          >
            <Image
              src={img}
              alt={alt}
              width={56}
              height={56}
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
