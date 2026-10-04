'use client';

import { Product } from '@/lib/types/product';
import { Pencil, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProductsTable({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Products
        </h2>
        <Link
          href="/dashboard/products/add"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          <Plus className="mr-2 w-4 h-4" />
          Add Product
        </Link>
      </div>

      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="p-4">
              <input type="checkbox" className="w-4 h-4" />
            </th>
            <th className="px-6 py-3">Product Name</th>
            <th className="px-6 py-3">Color</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="p-4">
                <input type="checkbox" className="w-4 h-4" />
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {product.name}
              </td>
              <td className="px-6 py-4">
                {product.variants?.[0]?.color ?? '—'}
              </td>
              <td className="px-6 py-4">{product.category?.name ?? '—'}</td>
              <td className="px-6 py-4">
                €
                {product.variants?.[0]?.price
                  ? Number(product.variants[0].price).toFixed(2)
                  : '—'}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center items-center gap-3">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
