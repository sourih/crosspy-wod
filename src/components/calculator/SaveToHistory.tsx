import { Check } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useAppData } from '../../hooks/appDataContext';
import { Button } from '../ui/Button';

interface Props {
  onSave(): void;
  disabled?: boolean;
  /** Acciones secundarias que van al lado, como "Vaciar la barra". */
  children?: ReactNode;
}

const UNDO_MS = 6000;

/**
 * Guardar en el historial, dentro del resultado. Después de guardar ofrece
 * deshacer unos segundos: lo último guardado es siempre la primera entrada.
 */
export function SaveToHistory({ onSave, disabled = false, children }: Props) {
  const { history, removeHistory } = useAppData();
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const undo = () => {
    const latest = history[0];
    if (latest) removeHistory(latest.id);
    setJustSaved(false);
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button
        variant="primary"
        disabled={disabled}
        onClick={() => {
          onSave();
          setJustSaved(true);
        }}
      >
        Guardar en el historial
      </Button>
      {children}
      <span role="status" className="inline-flex min-h-11 items-center gap-2 text-body">
        {justSaved && (
          <>
            <span className="inline-flex items-center gap-1 text-positive">
              <Check size={16} aria-hidden />
              Guardado
            </span>
            <button
              type="button"
              onClick={undo}
              className="min-h-11 px-1 font-medium text-ink underline underline-offset-4"
            >
              Deshacer
            </button>
          </>
        )}
      </span>
    </div>
  );
}
