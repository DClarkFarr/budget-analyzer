/**
 * EXAMPLE
 */
/*
import { useCacheQuery } from "@/_server/prisma/query";
import { revalidateTag } from "next/cache";

export const useCarQuery = (id: string) => {
  return useCacheQuery<Car>(`/api/car/${id}`);
};

export const usePaginatedCarsQuery = (page: number = 1, limit = 10) => {
  const query = useCacheQuery<Car[]>(`/api/car`, { page, limit }, null, [
    `/api/car/${page}`,
    "/api/car",
  ]);

  return Object.assign(query, {
    clearAll: async () => {
      "use server";

      revalidateTag("/api/car");
    },
  });
};

export const usePaginatedUserCarsQuery = (page: number = 1, limit = 10) => {
  const query = useCacheQuery<Car[]>(`/api/user/car`, { page, limit }, null, [
    `/api/user/car/${page}`,
    "/api/user/car",
  ]);

  return Object.assign(query, {
    clearAll: async () => {
      "use server";

      revalidateTag("/api/car/user");
    },
  });
};

export const getPaginatedCarsQuery = usePaginatedCarsQuery;
export const getPaginatedUserCarsQuery = usePaginatedUserCarsQuery;
*/
