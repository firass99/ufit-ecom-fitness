'use client';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';

import { useEffect, useState } from 'react';
import { getOrders, updateOrder } from '@/lib/actions/orders';
import { Order } from '@/lib/types/types';
import { OrderStatus } from '@/lib/types/enum';
import { toast } from 'sonner';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { useTranslations } from 'next-intl';

const STATUS_OPTIONS = Object.values(OrderStatus);

function getOrderStatusClass(status: string) {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    /* case OrderStatus.PAID:
      return 'bg-blue-100 text-blue-800';
    case OrderStatus.PROCESSING:
      return 'bg-indigo-100 text-indigo-700';
    case OrderStatus.SHIPPED: 
      return 'bg-purple-100 text-purple-800';*/
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-700';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-muted-foreground/10 text-muted-foreground';
  }
}

export default function OrdersTableClient({
  initialOrders,
  totalPages: initialTotalPages,
}: {
  initialOrders: Order[];
  totalPages: number;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getOrders(
          currentPage,
          10,
          statusFilter !== tCommon('all') ? statusFilter : undefined,
          dateFrom,
          dateTo,
        );
        setOrders(res?.data || []);
        setTotalPages(res?.totalPages || 1);
      } catch {
        toast.error(tCommon('failToShow') + ' ' + t('orders'));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [currentPage, statusFilter, dateFrom, dateTo]);

  async function handleUpdateStatus(order: Order, newStatus: OrderStatus) {
    setSubmitting(true);
    try {
      await updateOrder(order.id, { status: newStatus });
      toast.success(tCommon('updated') + ' ' + tCommon('status'));
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)),
      );
      setSelectedOrder((old) => (old ? { ...old, status: newStatus } : old));
    } catch {
      toast.error(tCommon('failToUpdate') + ' ' + tCommon('status'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{`${t('list')} ${t('orders')}`}</h1>
      {/* Filter Row */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="status" className="w-[150px]">
            <SelectValue>
              {statusFilter === 'ALL'
                ? tCommon('all') + ' ' + tCommon('status')
                : statusFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {tCommon('all') + ' ' + tCommon('status')}
            </SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px]"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px]"
            placeholder="To"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto bg-background">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-1/2 mb-3" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            {tCommon('notFound')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{tCommon('user')}</TableHead>
                <TableHead>{tCommon('status')}</TableHead>
                <TableHead>{tCommon('total')}</TableHead>
                <TableHead>{tCommon('date')}</TableHead>
                <TableHead>{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-mono">{order.id.slice(0, 8)}...</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">
                        {order.user?.fullName || '-'}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {order.user?.email || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`capitalize px-2 py-1 rounded text-xs font-semibold ${getOrderStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      €{Number(order.totalPrice).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : ''}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={selectedOrder?.id === order.id}
                      onOpenChange={(open) => {
                        setSelectedOrder(open ? order : null);
                        setStatusUpdate(order.status);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          {tCommon('view')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {tCommon('order')}{' '}
                            <span className="font-mono">
                              {order.id.slice(0, 8)}...
                            </span>
                          </DialogTitle>
                          <DialogDescription>
                            {order.user?.fullName || '-'} (
                            {order.user?.email || '-'})<br />
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <b>{tCommon('status')}:</b>{' '}
                            <span
                              className={`capitalize px-2 py-1 rounded text-xs font-semibold ${getOrderStatusClass(selectedOrder?.status ?? order.status)}`}
                            >
                              {selectedOrder?.status ?? order.status}
                            </span>
                          </div>
                          <div>
                            <b>
                              {tCommon('update') + ' ' + tCommon('status')}:
                            </b>
                            <Select
                              value={statusUpdate ?? order.status}
                              onValueChange={(val) =>
                                setStatusUpdate(val as OrderStatus)
                              }
                            >
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              className="w-full mt-3"
                              disabled={
                                submitting ||
                                !statusUpdate ||
                                statusUpdate === order.status
                              }
                              onClick={() =>
                                statusUpdate &&
                                handleUpdateStatus(order, statusUpdate)
                              }
                            >
                              {submitting
                                ? tCommon('saving')
                                : tCommon('update')}
                            </Button>
                          </div>
                          <div>
                            <b>{tCommon('total')}:</b>{' '}
                            <span className="font-mono">
                              €{Number(order.totalPrice).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <b>{tCommon('items')}:</b>
                            <ul className="mt-2 space-y-2">
                              {order.items.map((item, i) => {
                                const isVariant = !!item.variant;
                                const product = isVariant
                                  ? item.variant?.product
                                  : item.product;
                                return (
                                  <li
                                    key={i}
                                    className="border rounded px-2 py-1 flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-semibold">
                                        {product?.name || '—'}
                                      </span>{' '}
                                      <span className="text-xs text-muted-foreground">
                                        {isVariant && item.variant?.size && (
                                          <>[{item.variant.size}] </>
                                        )}
                                        {isVariant && item.variant?.color && (
                                          <>{item.variant.color}</>
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      ×{item.quantity}{' '}
                                      <span className="font-mono">
                                        €{Number(item.price).toFixed(2)}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            {tCommon('previous')}
          </Button>
          <span className="px-3 py-2 text-sm border rounded">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            {tCommon('next')}
          </Button>
        </div>
      )}
    </div>
  );
}
