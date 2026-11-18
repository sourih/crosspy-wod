import { BarSelector } from '../../components/calculator/BarSelector';
import { LoadDetail } from '../../components/calculator/LoadDetail';
import { LoadStats } from '../../components/calculator/LoadStats';
import { LoadStatus } from '../../components/calculator/LoadStatus';
import { PercentPicker } from '../../components/calculator/PercentPicker';
import { SaveToHistory } from '../../components/calculator/SaveToHistory';
import { PageHeader } from '../../components/layout/PageHeader';
import { PlateChips } from '../../components/plates/PlateChips';
import { Field } from '../../components/ui/Field';
import { Panel, PanelTitle } from '../../components/ui/Panel';
import { useAppData } from '../../hooks/appDataContext';
import { resolveBar } from '../../hooks/useSelectedBar';
import { percentOf } from '../../services/calc/percentage';
import { calculateLoad, maxLoad } from '../../services/calc/plates';
import type { LoadResult } from '../../types';
import { validateReference } from '../../utils/validation';
import { formatKg, formatPercent } from '../../utils/weight';

/** Lo que dice la barra fija y el anuncio para lectores de pantalla. */
function spokenResult(result: LoadResult, target: number): string {
  if (result.status === 'invalid') return 'La carga es menor que la barra.';
  if (result.status === 'approximate') return `${formatKg(target)} kilos no se pueden armar exactos.`;
  return `Carga objetivo ${formatKg(target)} kilos, ${formatKg(result.perSide)} por lado.`;
}

/**
 * En el celular el resultado completo queda debajo de los datos, así que una
 * barra fija arriba mantiene a la vista el peso y los discos por lado mientras
 * se cambia el porcentaje.
 */
function StickyResult({ result, target }: { result: LoadResult; target: number }) {
  return (
    <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 -mx-4 mb-[14px] border-b border-raised bg-ground px-4 py-2.5 md:hidden">
      <div className="flex items-center gap-3">
        <p className="num flex-none text-figure font-semibold text-accent">
          {formatKg(target)}
          <span className="pl-1 text-body font-normal text-muted">kg</span>
        </p>
        <div className="min-w-0 flex-1">
          {result.status === 'exact' ? (
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="flex-none text-small text-muted">Por lado</span>
              <PlateChips combination={result.combinations[0] ?? []} />
            </div>
          ) : (
            <p className="text-small text-muted">
              {result.status === 'approximate'
                ? 'No se arma exacto: mirá las cargas más cercanas abajo.'
                : 'Es menor que la barra.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Módulo A: carga de trabajo a partir del RM y un porcentaje. */
export function RMCalculatorPage() {
  const { settings, stock, drafts, updateDraft, addHistory } = useAppData();
  const { reference, percent } = drafts.rm;
  const bar = resolveBar(settings, drafts.rm.barWeight);

  const check = validateReference(reference);
  const rm = check.ok ? check.value : null;
  const target = rm === null ? null : percentOf(rm, percent);
  const result = target === null ? null : calculateLoad({ target, bar: bar.weight, stock });

  const save = () => {
    if (rm === null || target === null || result?.status === 'invalid') return;
    addHistory({ type: 'rm', reference: rm, percent, target, bar: bar.weight });
  };

  return (
    <>
      <PageHeader
        title="Calculadora RM"
        summary={
          rm === null
            ? 'Tu carga de trabajo y los discos por lado, a partir de tu RM.'
            : `${formatPercent(percent)} % de ${formatKg(rm)} kg, con la barra de ${formatKg(bar.weight)} kg.`
        }
      />
      {result && target !== null && <StickyResult result={result} target={target} />}
      <p className="sr-only" aria-live="polite">
        {result && target !== null ? spokenResult(result, target) : ''}
      </p>
      {/* 12 columnas, separación 14: 5 + 7 */}
      <div className="grid items-start gap-[14px] md:grid-cols-12">
        <Panel className="flex flex-col gap-6 md:col-span-5 md:h-full" aria-label="Datos">
          <Field
            label="RM de referencia"
            size="large"
            suffix="kg"
            placeholder="100"
            hint={reference === '' ? 'Tu máximo a una repetición en este movimiento.' : undefined}
            value={reference}
            onChange={(value) => updateDraft('rm', { reference: value })}
            error={reference !== '' && !check.ok ? check.message : null}
          />
          <BarSelector
            bars={settings.bars}
            value={bar.weight}
            onChange={(weight) => updateDraft('rm', { barWeight: weight })}
          />
          <PercentPicker
            presets={settings.rmPercentages}
            value={percent}
            onChange={(value) => updateDraft('rm', { percent: value })}
          />
          <p className="num mt-auto flex flex-wrap items-baseline justify-between gap-2 text-body text-muted">
            <span>
              Carga máxima con esta barra:{' '}
              <span className="font-medium text-ink">{formatKg(maxLoad(bar.weight, stock))} kg</span>
            </span>
            <a href="#ajustes" className="font-medium text-ink underline-offset-4 hover:underline">
              Configurar el box
            </a>
          </p>
        </Panel>

        <Panel className="md:col-span-7" aria-label="Resultado">
          <div className="flex items-start justify-between gap-3">
            <PanelTitle>Carga objetivo</PanelTitle>
            {result && <LoadStatus result={result} />}
          </div>
          {result === null || target === null ? (
            <p className="mt-3 rounded-inner px-4 py-6 text-body text-pretty text-muted outline-1 -outline-offset-1 outline-control outline-dashed">
              Ingresá tu RM para ver la carga y qué discos poner en cada lado.
            </p>
          ) : (
            <>
              <p className="num mt-2 text-answer font-semibold text-accent">
                {formatKg(target)}
                <span className="pl-1.5 text-section font-normal text-muted">kg</span>
              </p>
              <div className="mt-4">
                <LoadStats
                  bar={bar.weight}
                  platesTotal={result.status === 'invalid' ? null : target - bar.weight}
                />
              </div>
              <div className="mt-5">
                <LoadDetail key={`${target}-${bar.weight}`} result={result} stock={stock} />
              </div>
              <SaveToHistory onSave={save} disabled={result.status === 'invalid'} />
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
