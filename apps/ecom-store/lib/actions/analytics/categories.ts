'use server';

export interface CategoryProductStat {
  id: string;
  category: string;
  count: number;
}

export interface TopCategoryStat {
  category: string;
  orderCount: number;
  revenue: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getTotalCategories(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/analytics/categories`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Error response from total categories endpoint: ${errorText}`,
      );
      throw new Error(errorText);
    }

    const data = await res.json();
    return typeof data === 'number' ? data : 0;
  } catch (error) {
    console.error('Error in getTotalCategories:', error);
    return 0; // Return 0 as fallback
  }
}

export async function getProductsPerCategory(): Promise<CategoryProductStat[]> {
  try {
    const res = await fetch(
      `${API_URL}/analytics/categories/products/distribution`,
      {
        cache: 'no-store',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Error response from products-per-category endpoint: ${errorText}`,
      );
      throw new Error(errorText);
    }

    const data = await res.json();
    console.log('Products per category data received:', data);
    return data;
  } catch (error) {
    console.error('Error in getProductsPerCategory:', error);
    return [];
  }
}

export async function getTopCategoriesBySales(
  limit: number = 5,
): Promise<TopCategoryStat[]> {
  try {
    console.log(
      `Fetching from: ${API_URL}/analytics/categories/top-sales?limit=${limit}`,
    );
    const res = await fetch(
      `${API_URL}/analytics/categories/top-sales?limit=${limit}`,
      {
        cache: 'no-store',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error response from top-sales endpoint: ${errorText}`);
      throw new Error(errorText);
    }

    const data = await res.json();
    console.log('Top sales data received:', data);

    // Return empty array if data is not in expected format
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data);
      return [];
    }

    return data.map((item: any) => ({
      category: item.category || 'Unknown',
      orderCount: item.count || 0,
      revenue: item.revenue || 0,
    }));
  } catch (error) {
    console.error('Error in getTopCategoriesBySales:', error);
    // Return empty array instead of throwing to prevent page from crashing
    return [];
  }
}

export async function getTopPerformingCategories(
  limit: number = 5,
): Promise<TopCategoryStat[]> {
  try {
    const res = await fetch(
      `${API_URL}/analytics/categories/top-performing?limit=${limit}`,
      {
        cache: 'no-store',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Error response from top-performing endpoint: ${errorText}`,
      );
      throw new Error(errorText);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data);
      return [];
    }

    return data.map((item: any) => ({
      category: item.category || 'Unknown',
      orderCount: item.count || 0,
      revenue: 0,
    }));
  } catch (error) {
    console.error('Error in getTopPerformingCategories:', error);
    return [];
  }
}
