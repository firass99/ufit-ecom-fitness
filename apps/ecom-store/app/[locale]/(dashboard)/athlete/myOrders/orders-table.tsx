'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/design-system/components/ui/table';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';

import { Order } from '@/lib/types/types';
import { OrderStatus } from '@/lib/types/enum';
import { useState } from 'react';

function getOrderStatusClass(status: string) {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
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
}: {
  initialOrders: Order[];
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!initialOrders || initialOrders.length === 0) {
    return (
      <div className="border rounded-md p-10 text-center text-muted-foreground bg-background mt-6">
        No orders found.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto bg-background mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <span className="font-mono">{order.id.slice(0, 8)}...</span>
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
                  €{Number(order.totalPrice || 0).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell>
                <Dialog
                  open={selectedOrder?.id === order.id}
                  onOpenChange={(open) => setSelectedOrder(open ? order : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Order{' '}
                        <span className="font-mono">
                          {order.id.slice(0, 8)}...
                        </span>
                      </DialogTitle>
                      <DialogDescription>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : ''}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div>
                        <b>Status:</b>{' '}
                        <span
                          className={`capitalize px-2 py-1 rounded text-xs font-semibold ${getOrderStatusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <b>Total:</b>{' '}
                        <span className="font-mono">
                          €{Number(order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <b>Items:</b>
                        <ul className="mt-2 space-y-2">
                          {Array.isArray(order.items) &&
                          order.items.length > 0 ? (
                            order.items.map((item, i) => {
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
                            })
                          ) : (
                            <li className="text-muted-foreground text-sm">
                              No items
                            </li>
                          )}
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
    </div>
  );
}
