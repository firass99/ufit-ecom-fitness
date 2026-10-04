'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/design-system/components/ui/table';
import { getUser } from '@/lib/actions/users';
import { ReceiptText } from 'lucide-react';

export default function UserDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const userId = params.id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const profile = await getUser(userId);
        setUser(profile);
      } catch {
        // handle error if needed
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
      </div>
    );
  }

  if (!user) return <div className="p-6">No user found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      {/* USER GENERAL INFO */}
      <Card>
        <CardContent className="p-6 flex gap-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {user.fullName?.slice(0, 1).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <div className="text-md text-muted-foreground">{user.email}</div>
            <div>
              <Badge variant="default" className="uppercase text-xs">
                {user.role}
              </Badge>
            </div>
            <div className="text-md text-muted-foreground">ID: {user.id}</div>
            <div className="text-md text-muted-foreground">
              Joined:{' '}
              {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROLE-SPECIFIC PROFILE (shows "profile is empty" only if missing) */}
      {user.role === 'ATHLETE' ? (
        user.athlete ? (
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="text-lg font-bold mb-4">Athlete Profile</h3>
              <div>
                <Label>Age:</Label>{' '}
                <span className="ml-2">{user.athlete.age}</span>
              </div>
              <div>
                <Label>Weight:</Label>{' '}
                <span className="ml-2">{user.athlete.weight} kg</span>
              </div>
              <div>
                <Label>Height:</Label>{' '}
                <span className="ml-2">{user.athlete.height} cm</span>
              </div>
              <div>
                <Label>Phone:</Label>{' '}
                <span className="ml-2">{user.athlete.phone}</span>
              </div>
              <div>
                <Label>Address:</Label>{' '}
                <span className="ml-2">{user.athlete.address}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-md text-muted-foreground">Profile is empty</div>
        )
      ) : user.role === 'COACH' ? (
        user.coach ? (
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="text-lg font-bold mb-4">Coach Profile</h3>
              <div>
                <Label>Gym Address:</Label>{' '}
                <span className="ml-2">{user.coach.gymAddress}</span>
              </div>
              <div>
                <Label>Experience:</Label>{' '}
                <span className="ml-2">{user.coach.experience}</span>
              </div>
              <div>
                <Label>Phone:</Label>{' '}
                <span className="ml-2">{user.coach.phone}</span>
              </div>
              <div>
                <Label>Specialities:</Label>{' '}
                <span className="ml-2">
                  {user.coach.specialities?.join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-md text-muted-foreground">Profile is empty</div>
        )
      ) : user.role === 'NUTRITIONIST' ? (
        user.nutritionist ? (
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="text-lg font-bold mb-4">Nutritionist Profile</h3>
              <div>
                <Label>Working Address:</Label>{' '}
                <span className="ml-2">{user.nutritionist.workingAddress}</span>
              </div>
              <div>
                <Label>Experience:</Label>{' '}
                <span className="ml-2">{user.nutritionist.experience}</span>
              </div>
              <div>
                <Label>Phone:</Label>{' '}
                <span className="ml-2">{user.nutritionist.phone}</span>
              </div>
              <div>
                <Label>CV:</Label>{' '}
                <span className="ml-2 break-all">{user.nutritionist.cv}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-md text-muted-foreground">Profile is empty</div>
        )
      ) : null}

      {/* ORDERS */}
      {user.orders && user.orders.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptText className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-bold">Orders</h3>
              <Badge variant="secondary">{user.orders.length}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {order.id.slice(0, 8)}…
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.createdAt &&
                        new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      ${parseFloat(order.totalPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>{order.items?.length ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
