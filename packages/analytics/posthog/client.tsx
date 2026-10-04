/* 'use client';

import { env } from '@repo/env';
import posthogRaw, { type PostHog } from 'posthog-js';
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';
import type { ReactNode } from 'react';

export const analytics = posthogRaw.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: '/ingest',
  ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  capture_pageleave: true, // Overrides the `capture_pageview` setting
}) as PostHog;

type PostHogProviderProps = {
  readonly children: ReactNode;
};

export const PostHogProvider = (
  properties: Omit<PostHogProviderProps, 'client'>,
) => <PostHogProviderRaw client={analytics} {...properties} />;
DOWN TO BYPASS 
*/
'use client';

import { env } from '@repo/env';
import posthogRaw, { type PostHog } from 'posthog-js';
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';
import type { ReactNode } from 'react';

// Ensure PostHog is only initialized on the client
export const analytics: PostHog | null =
  typeof window !== 'undefined'
    ? (posthogRaw.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
      }) as PostHog)
    : null;

type PostHogProviderProps = {
  readonly children: ReactNode;
};

// Ensure PostHogProvider doesn't break if `analytics` is null
export const PostHogProvider = (
  properties: Omit<PostHogProviderProps, 'client'>,
) =>
  analytics ? (
    <PostHogProviderRaw client={analytics} {...properties} />
  ) : (
    <>{properties.children}</>
  );
