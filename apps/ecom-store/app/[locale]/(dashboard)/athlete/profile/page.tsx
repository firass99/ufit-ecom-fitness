'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { toast } from 'sonner';
import { getSession } from '@/lib/actions/session';
import { updateUser } from '@/lib/actions/users';
import { getUserProfile } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types/types';

// Import your server actions for updating athlete/coach/nutritionist
import { updateAthlete } from '@/lib/actions/athletes';
import { updateCoach } from '@/lib/actions/coachs';
import { updateNutritionist } from '@/lib/actions/nutritionists';
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Main user form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<{ fullName: string; email: string }>({
    defaultValues: { fullName: '', email: '' },
  });

  // --- Athlete form (all as strings in form) ---
  const {
    register: athleteRegister,
    handleSubmit: handleAthleteSubmit,
    reset: resetAthlete,
    formState: { isSubmitting: isAthleteSubmitting, isDirty: isAthleteDirty },
  } = useForm<{
    age: string;
    weight: string;
    height: string;
    phone: string;
    address: string;
  }>({
    defaultValues: {
      age: '',
      weight: '',
      height: '',
      phone: '',
      address: '',
    },
  });

  // --- Coach form ---
  const {
    register: coachRegister,
    handleSubmit: handleCoachSubmit,
    reset: resetCoach,
    formState: { isSubmitting: isCoachSubmitting, isDirty: isCoachDirty },
  } = useForm<{
    gymAddress: string;
    experience: string;
    phone: string;
    cv: string;
    specialities: string; // comma string in form
  }>({
    defaultValues: {
      gymAddress: '',
      experience: '',
      phone: '',
      cv: '',
      specialities: '',
    },
  });

  // --- Nutritionist form ---
  const {
    register: nutriRegister,
    handleSubmit: handleNutriSubmit,
    reset: resetNutri,
    formState: { isSubmitting: isNutriSubmitting, isDirty: isNutriDirty },
  } = useForm<{
    workingAddress: string;
    experience: string;
    phone: string;
    cv: string;
  }>({
    defaultValues: {
      workingAddress: '',
      experience: '',
      phone: '',
      cv: '',
    },
  });

  // --- Load Profile ---
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session) throw new Error('No session');
        setUserId(session.user.id);
        const profile = await getUserProfile(session.accessToken);
        setUser(profile);

        // Main info
        reset({
          fullName: profile.fullName,
          email: profile.email,
        });
        // Athlete
        if (profile.athlete) {
          resetAthlete({
            age: profile.athlete.age?.toString() ?? '',
            weight: profile.athlete.weight?.toString() ?? '',
            height: profile.athlete.height?.toString() ?? '',
            phone: profile.athlete.phone ?? '',
            address: profile.athlete.address ?? '',
          });
        }
        // Coach
        if (profile.coach) {
          resetCoach({
            gymAddress: profile.coach.gymAddress ?? '',
            experience: profile.coach.experience ?? '',
            phone: profile.coach.phone ?? '',
            cv: profile.coach.cv ?? '',
            specialities: profile.coach.specialities?.join(', ') ?? '',
          });
        }
        // Nutritionist
        if (profile.nutritionist) {
          resetNutri({
            workingAddress: profile.nutritionist.workingAddress ?? '',
            experience: profile.nutritionist.experience ?? '',
            phone: profile.nutritionist.phone ?? '',
            cv: profile.nutritionist.cv ?? '',
          });
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [reset, resetAthlete, resetCoach, resetNutri]);

  // --- Submit handlers ---
  const onSubmit = async (data: { fullName: string }) => {
    if (!userId) return toast.error('No user ID');
    if (!isDirty) return toast.info('No changes to save.');
    try {
      await updateUser(userId, { fullName: data.fullName });
      toast.success('Profile updated!');
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
      router.refresh();
    } catch {
      toast.error('Update failed');
    }
  };

  // ATHLETE submit
  const onAthleteSubmit = async (data: any) => {
    if (!user?.athlete?.id) return toast.error('No athlete profile found');
    try {
      await updateAthlete(user.athlete.id, {
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        phone: data.phone,
        address: data.address,
      });
      toast.success('Athlete profile updated!');
      router.refresh();
    } catch {
      toast.error('Failed to update athlete profile');
    }
  };

  // COACH submit
  const onCoachSubmit = async (data: any) => {
    if (!user?.coach?.id) return toast.error('No coach profile found');
    try {
      await updateCoach(user.coach.id, {
        gymAddress: data.gymAddress,
        experience: data.experience,
        phone: data.phone,
        specialities: data.specialities
          ? data.specialities.split(',').map((s: string) => s.trim())
          : [],
      });
      toast.success('Coach profile updated!');
      router.refresh();
    } catch {
      toast.error('Failed to update coach profile');
    }
  };

  // NUTRITIONIST submit
  const onNutriSubmit = async (data: any) => {
    if (!user?.nutritionist?.id)
      return toast.error('No nutritionist profile found');
    try {
      await updateNutritionist(user.nutritionist.id, {
        workingAddress: data.workingAddress,
        experience: data.experience,
        phone: data.phone,
        cv: data.cv,
      });
      toast.success('Nutritionist profile updated!');
      router.refresh();
    } catch {
      toast.error('Failed to update nutritionist profile');
    }
  };

  // --- Skeleton Loader ---
  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <div className="flex flex-row items-center gap-4 mb-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!user) return <div className="p-6">No user found.</div>;

  return (
    <section className="max-w-xl mx-auto mt-8 px-2 md:px-0">
      {/* Main profile */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 border p-6 rounded-2xl bg-background shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground select-none">
            {user.fullName?.slice(0, 1).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            {user.role && (
              <Badge className="mt-1 uppercase" variant="secondary">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            {...register('fullName', { required: true })}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            disabled
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Saving…' : 'Update Profile'}
        </Button>
      </form>

      {/* ATHLETE */}
      {user.role === 'ATHLETE' && (
        <form
          onSubmit={handleAthleteSubmit(onAthleteSubmit)}
          className="space-y-4 border p-6 rounded-2xl bg-background shadow-md mt-6"
        >
          <h3 className="text-lg font-bold mb-4">Athlete Profile</h3>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={0}
              {...athleteRegister('age', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={0}
              {...athleteRegister('weight', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min={0}
              {...athleteRegister('height', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...athleteRegister('phone')} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...athleteRegister('address')} />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isAthleteSubmitting || !isAthleteDirty}
          >
            {isAthleteSubmitting ? 'Saving…' : 'Update Athlete Profile'}
          </Button>
        </form>
      )}

      {/* COACH */}
      {user.role === 'COACH' && (
        <form
          onSubmit={handleCoachSubmit(onCoachSubmit)}
          className="space-y-4 border p-6 rounded-2xl bg-background shadow-md mt-6"
        >
          <h3 className="text-lg font-bold mb-4">Coach Profile</h3>
          <div>
            <Label htmlFor="gymAddress">Gym Address</Label>
            <Input id="gymAddress" {...coachRegister('gymAddress')} />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" {...coachRegister('experience')} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...coachRegister('phone')} />
          </div>
          <div>
            <Label htmlFor="cv">CV (link)</Label>
            <Input id="cv" {...coachRegister('cv')} />
          </div>
          <div>
            <Label htmlFor="specialities">Specialities (comma-separated)</Label>
            <Input id="specialities" {...coachRegister('specialities')} />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isCoachSubmitting || !isCoachDirty}
          >
            {isCoachSubmitting ? 'Saving…' : 'Update Coach Profile'}
          </Button>
        </form>
      )}

      {/* NUTRITIONIST */}
      {user.role === 'NUTRITIONIST' && (
        <form
          onSubmit={handleNutriSubmit(onNutriSubmit)}
          className="space-y-4 border p-6 rounded-2xl bg-background shadow-md mt-6"
        >
          <h3 className="text-lg font-bold mb-4">Nutritionist Profile</h3>
          <div>
            <Label htmlFor="workingAddress">Working Address</Label>
            <Input
              id="workingAddress"
              {...nutriRegister('workingAddress', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" {...nutriRegister('experience')} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...nutriRegister('phone')} />
          </div>
          <div>
            <Label htmlFor="cv">CV (link)</Label>
            <Input id="cv" {...nutriRegister('cv')} />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isNutriSubmitting || !isNutriDirty}
          >
            {isNutriSubmitting ? 'Saving…' : 'Update Nutritionist Profile'}
          </Button>
        </form>
      )}
    </section>
  );
}
