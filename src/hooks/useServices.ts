import { useQuery } from "@tanstack/react-query";

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  tier: string;
  price: string;
  features: string[];
  deliveryDays: number;
  revisions: number | null;
  isPopular: boolean;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  packages: Package[];
  startingPrice?: string | null;
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const r = await fetch("/api/services");
      if (!r.ok) throw new Error("Failed to load services");
      return r.json();
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useServicesWithPackages() {
  return useQuery<Service[]>({
    queryKey: ["/api/services", "with-packages"],
    queryFn: async () => {
      const r = await fetch("/api/services?include=packages");
      if (!r.ok) throw new Error("Failed to load services");
      return r.json();
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useService(slug: string) {
  return useQuery<Service>({
    queryKey: ["/api/services", slug],
    queryFn: async () => {
      const r = await fetch(`/api/services/${slug}`);
      if (!r.ok) throw new Error("Service not found");
      return r.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
