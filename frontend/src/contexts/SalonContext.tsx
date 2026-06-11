"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { SALON_NAME } from "@/lib/constants";

interface SalonContextType {
  salonName: string;
}

const SalonContext = createContext<SalonContextType>({ salonName: SALON_NAME });

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [salonName, setSalonName] = useState(SALON_NAME);

  useEffect(() => {
    publicApi
      .getSettings()
      .then((res) => setSalonName(res.data.salon_name))
      .catch(() => {});
  }, []);

  return (
    <SalonContext.Provider value={{ salonName }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  return useContext(SalonContext);
}
