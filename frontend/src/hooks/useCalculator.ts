"use client";
// hooks/useCalculator.ts
// Manages the full calculator lifecycle: options loading, form state,
// rate editing, system type selection, submission, and results.

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type {
  Options, FormState, CalculationResponse, SystemType,
} from "@/lib/types";

interface UseCalculatorReturn {
  // Data
  options:        Options | null;
  result:         CalculationResponse | null;
  // Form state
  form:           FormState;
  rate:           number;
  // Status
  loadingOptions: boolean;
  calculating:    boolean;
  error:          string | null;
  // Actions
  setIsland:           (island: string) => void;
  setZone:             (zone: string) => void;
  setField:            (field: keyof Omit<FormState, "island" | "zone" | "system_type">, value: string) => void;
  setSystemType:       (type: SystemType) => void;
  setRate:             (rate: number) => void;
  onDistributorChange: (distributorKey: string) => void;
  calculate:           () => Promise<void>;
  reset:               () => void;
}

const EMPTY_FORM: FormState = {
  island:       null,
  zone:         null,
  roof_area:    null,
  monthly_bill: null,
  quality_tier: null,
  system_type:  "grid_tied",   // default — backend also defaults to this
};

export function useCalculator(): UseCalculatorReturn {
  const [options,        setOptions]        = useState<Options | null>(null);
  const [result,         setResult]         = useState<CalculationResponse | null>(null);
  const [form,           setForm]           = useState<FormState>(EMPTY_FORM);
  const [rate,           setRate]           = useState<number>(13.23);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [calculating,    setCalculating]    = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // Load options once on mount; initialise rate from backend default
  useEffect(() => {
    api.getOptions()
      .then((data) => {
        setOptions(data);
        setRate(data.rate_config.default_php);
      })
      .catch(() => setError("Could not load options. Is the backend running?"))
      .finally(() => setLoadingOptions(false));
  }, []);

  const setIsland = useCallback((island: string) => {
    setForm((f) => ({ ...f, island, zone: null }));
  }, []);

  const setZone = useCallback((zone: string) => {
    setForm((f) => ({ ...f, zone }));
  }, []);

  const setField = useCallback(
    (field: keyof Omit<FormState, "island" | "zone" | "system_type">, value: string) => {
      setForm((f) => ({ ...f, [field]: value }));
    },
    []
  );

  const setSystemType = useCallback((type: SystemType) => {
    setForm((f) => ({ ...f, system_type: type }));
  }, []);

  // When the user picks a distributor, pre-fill the rate from that distributor's default
  const onDistributorChange = useCallback(
    (distributorKey: string) => {
      if (!options) return;
      const dist = options.distributors[distributorKey];
      if (dist) setRate(dist.default_rate_php);
    },
    [options]
  );

  const calculate = useCallback(async () => {
    if (!form.zone || !form.roof_area || !form.monthly_bill || !form.quality_tier) {
      setError("Please complete all steps before calculating.");
      return;
    }
    setError(null);
    setCalculating(true);
    try {
      const res = await api.calculate({
        zone:                 form.zone,
        roof_area:            form.roof_area,
        monthly_bill:         form.monthly_bill,
        quality_tier:         form.quality_tier,
        electricity_rate_php: rate,
        system_type:          form.system_type,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Calculation failed.");
    } finally {
      setCalculating(false);
    }
  }, [form, rate]);

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setResult(null);
    setError(null);
  }, []);

  return {
    options,
    result,
    form,
    rate,
    loadingOptions,
    calculating,
    error,
    setIsland,
    setZone,
    setField,
    setSystemType,
    setRate,
    onDistributorChange,
    calculate,
    reset,
  };
}
