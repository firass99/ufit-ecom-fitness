import { analytics } from '@repo/analytics/posthog/server';
import { flag } from '@vercel/flags/next';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      // const { userId } = await auth();
      const userId = '73a6b71f-dc5e-4d07-bab6-077082853ee1';

      if (!userId) {
        console.log('user id ', userId);
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, userId);

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
