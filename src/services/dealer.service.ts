// src/services/dealer.service.ts

import api from "@/lib/api";

export async function getDealers() {
  const response = await api.get("/dealers");

  return response.data.data;
}

export async function getDealerById(
  dealerId: string,
) {
  const response = await api.get(
    `/dealers/${dealerId}`,
  );

  return response.data.data;
}