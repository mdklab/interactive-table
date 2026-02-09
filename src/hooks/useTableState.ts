import { useCallback, useState } from "react";
import { loadPersistedState, parseCSV, savePersistedState, PersistedState } from "../services/dataService";

export function useTableState() {
  const [state, setState] = useState<PersistedState>(() => loadPersistedState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDataset = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      const text = await file.text();
      const dataset = parseCSV(text);
      setState((prev) => {
        const nextState: PersistedState = {
          ...prev,
          dataset,
          uploadedAt: new Date().toISOString(),
        };
        savePersistedState(nextState);
        return nextState;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to parse the file";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreviewCount = useCallback((previewRowCount: number) => {
    setState((prev) => {
      const nextState: PersistedState = {
        ...prev,
        ui: { ...prev.ui, previewRowCount },
      };
      savePersistedState(nextState);
      return nextState;
    });
  }, []);

  return {
    state,
    uploadDataset,
    updatePreviewCount,
    loading,
    error,
  };
}
