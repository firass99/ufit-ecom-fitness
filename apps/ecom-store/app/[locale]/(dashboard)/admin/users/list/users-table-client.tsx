'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteUser } from '@/lib/actions/users';
import { User } from '@/lib/types/types';
import { Role } from '@/lib/types/enum';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { RTLWrapper, useRTL } from '@/components/ui/rtl-wrapper';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/design-system/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/design-system/components/ui/select';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';

function OnlineStatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`relative flex h-3 w-3 mx-auto
        ${active ? 'bg-green-500' : 'bg-red-500'}
        rounded-full
        before:content-[''] before:absolute before:-inset-2 before:rounded-full
        ${
          active
            ? 'before:bg-green-400/80 before:animate-pulse'
            : 'before:bg-red-400/80 before:animate-pulse'
        }
      `}
      title={active ? 'Active' : 'Offline'}
    />
  );
}

export default function UsersTableClient({
  initialUsers,
  totalPages,
}: {
  initialUsers: User[];
  totalPages: number;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');
  const tTables = useTranslations('dashboard.tables');
  const rtl = useRTL();

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete'))) return;
    try {
      await deleteUser(id);
      toast.success(tCommon('deleteSuccess'));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error(tCommon('deleteError'));
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role.toLowerCase() !== roleFilter)
      return false;
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'offline' && user.isActive) return false;

    const s = search.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(s) ||
      user.email.toLowerCase().includes(s)
    );
  });

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{`${t('list')} ${t('users')}`}</h1>
      {/* Filter Row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px] text-sm">
              <SelectValue
                placeholder={tCommon('filter') + ' - ' + t('users')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {tCommon('filter')} - {t('users')}
              </SelectItem>
              {Object.values(Role).map((role) => (
                <SelectItem key={role} value={role.toLowerCase()}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] text-sm">
              <SelectValue placeholder={tCommon('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('status')}</SelectItem>
              <SelectItem value="active">{tCommon('active')}</SelectItem>
              <SelectItem value="offline">{tCommon('offline')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder={
            tCommon('search') +
            ' ' +
            tCommon('name') +
            ' ' +
            tCommon('email') +
            '...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-[220px] text-sm ${rtl.isRTL ? 'text-right' : 'text-left'}`}
        />
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('name')}</TableHead>
              <TableHead>{tCommon('email')}</TableHead>
              <TableHead>{tCommon('role')}</TableHead>
              <TableHead>{tCommon('online')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <OnlineStatusDot active={!!user.isActive} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            {tCommon('previous')}
          </Button>
          <span className="px-3 py-2 text-sm border rounded">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            {tCommon('next')}
          </Button>
        </div>
      )}
    </div>
  );
}
