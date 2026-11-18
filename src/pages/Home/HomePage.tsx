import { ChevronRight } from 'lucide-react';
import { Barbell } from '../../components/plates/Barbell';
import { PlateSwatch } from '../../components/plates/PlateSwatch';
import { PlateChips } from '../../components/plates/PlateChips';
import { Button } from '../../components/ui/Button';
import { Panel, PanelTitle } from '../../components/ui/Panel';
import { useAppData } from '../../hooks/appDataContext';
import { useOpenEntry } from '../../hooks/useOpenEntry';
import { calculateLoad, maxLoad } from '../../services/calc/plates';
import type { RouteId } from '../../types';
import { describeEntry, formatWhen, MODULE_NAMES } from '../../utils/labels';
import { formatKg, formatLoad, kg } from '../../utils/weight';

/** Carga de ejemplo de la portada: 100 kg se arma con casi cualquier box. */
const EXAMPLE_TARGET = kg(100);

const MODULES: Array<{ route: RouteId; name: string; does: string }> = [
  { route: 'rm', name: 'Calculadora RM', does: 'Un porcentaje de tu RM y sus discos por lado.' },
  { route: 'strength', name: 'Strength', does: 'La tabla completa de porcentajes de un peso.' },
  { route: 'discos', name: 'Calculadora de discos', does: 'Armá la barra a mano y mirá cuánto pesa.' },
];

export function HomePage({ navigate }: { navigate(route: RouteId): void }) {
  const { history, settings, stock } = useAppData();
  const openEntry = useOpenEntry(navigate);
  const [last, ...rest] = history;
  const recent = rest.slice(0, 3);

  const lastLoad =
    last && last.type !== 'strength'
      ? calculateLoad({ target: last.target, bar: last.bar, stock, limit: 1 })
      : null;
  const totalPlates = settings.inventory.reduce((sum, item) => sum + item.quantity, 0);
  const mainBar = settings.bars[0];
  const exampleLoad =
    !last && mainBar ? calculateLoad({ target: EXAMPLE_TARGET, bar: mainBar.weight, stock, limit: 1 }) : null;

  const modules = (wide = false) => (
    <ul className={wide ? 'md:grid md:grid-cols-3 md:gap-x-6' : undefined}>
      {MODULES.map((module) => (
        <li key={module.route}>
          <a href={`#${module.route}`} className="flex min-h-[76px] items-center gap-3 rounded-inner">
            <span className="min-w-0 flex-1">
              <span className="block text-section font-semibold">{module.name}</span>
              <span className="block text-body text-muted">{module.does}</span>
            </span>
            <ChevronRight size={18} aria-hidden className="flex-none text-muted" />
          </a>
        </li>
      ))}
    </ul>
  );

  const box = (wide = false) => (
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <PanelTitle>Tu box</PanelTitle>
        <a href="#ajustes" className="text-body font-medium underline-offset-4 hover:underline">
          Configurar
        </a>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-0.5 overflow-hidden rounded-inner">
        <div className="bg-raised px-3 py-2.5">
          <dt className="text-small text-muted">Barras</dt>
          <dd
            className={`num mt-0.5 font-semibold whitespace-nowrap ${
              settings.bars.length === 2 ? 'text-section leading-7 md:text-figure' : 'text-figure'
            }`}
          >
            {settings.bars.length > 2 ? (
              settings.bars.length
            ) : (
              <>
                {settings.bars.map((bar) => formatKg(bar.weight)).join(' · ')}
                <span className="pl-1 text-body font-normal text-muted">kg</span>
              </>
            )}
          </dd>
        </div>
        <div className="bg-raised px-3 py-2.5">
          <dt className="text-small text-muted">Discos</dt>
          <dd className="num mt-0.5 text-figure font-semibold">{totalPlates}</dd>
        </div>
        <div className="bg-raised px-3 py-2.5">
          <dt className="text-small text-muted">Carga máxima</dt>
          <dd className="num mt-0.5 text-figure font-semibold">
            {mainBar ? formatKg(maxLoad(mainBar.weight, stock)) : '—'}
            <span className="pl-1 text-body font-normal text-muted">kg</span>
          </dd>
        </div>
      </dl>
      <p className="mt-4 mb-1 text-body font-medium">Discos, por par</p>
      <ul className={`grid gap-x-6 ${wide ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2'}`}>
        {settings.inventory.map((item) => {
          const pairs = Math.floor(item.quantity / 2);
          return (
            <li key={item.weight} className="flex h-9 items-center gap-2">
              <PlateSwatch weight={item.weight} scale={1 / 5} />
              <span className="num flex-1 text-body">{formatKg(item.weight)} kg</span>
              <span className="num text-body text-muted">
                {pairs === 0 ? '—' : `${pairs} ${pairs === 1 ? 'par' : 'pares'}`}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );

  // El titular de la marca. En el primer uso además carga la barra con un
  // ejemplo armado con los discos reales del box.
  const hero = (
    <header className="pt-6 pb-6 md:pt-10 md:pb-8">
      <h1 className="text-[40px] leading-[42px] font-bold tracking-[-0.03em] text-balance md:text-[56px] md:leading-[56px]">
        La fuerza está en vos.
      </h1>
      <p className="mt-3 max-w-[46ch] text-section text-muted">
        Tu carga del día y qué discos poner en cada lado, con lo que hay de verdad en tu box.
      </p>
    </header>
  );

  // Primer uso: sin cálculos guardados, la barra de ejemplo ocupa el lugar del resultado.
  if (!last) {
    return (
      <>
        {hero}
        <div className="grid gap-[14px]">
          <Panel>
            <div className="grid items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-7 md:order-2">
                {mainBar && (
                  <Barbell bar={mainBar.weight} combination={exampleLoad?.status === 'exact' ? exampleLoad.combinations[0] ?? [] : []} />
                )}
                {exampleLoad?.status === 'exact' && (
                  <p className="num mt-3 text-center text-body text-muted">
                    Así se ve el <span className="font-semibold text-accent">{formatKg(EXAMPLE_TARGET)} kg</span> con
                    tus discos: {formatKg(exampleLoad.perSide)} kg por lado.
                  </p>
                )}
              </div>
              <div className="md:col-span-5 md:order-1">
                <PanelTitle>Empezá por tu RM</PanelTitle>
                <p className="mt-1 text-body text-muted">
                  Ingresá tu máximo, elegí el porcentaje y listo.
                </p>
                <Button variant="primary" className="mt-4 w-full md:w-auto" onClick={() => navigate('rm')}>
                  Calcular con mi RM
                </Button>
              </div>
            </div>
            <div className="mt-4">{modules(true)}</div>
          </Panel>
          {box(true)}
        </div>
      </>
    );
  }

  return (
    <>
      {hero}
      {/* 12 columnas, separación 14: 7 + 5 */}
      <div className="grid items-start gap-[14px] md:grid-cols-12">
        <div className="grid gap-[14px] md:col-span-7">
          <Panel>
            <PanelTitle>Último cálculo</PanelTitle>
            <p className="num mt-1 text-body text-muted">
              {describeEntry(last)} · {MODULE_NAMES[last.type]} · {formatWhen(last.date)}
            </p>
            <p className="num mt-2 text-answer font-semibold text-accent">
              {formatKg(last.target)}
              <span className="pl-1.5 text-section font-normal text-muted">kg</span>
            </p>
            {lastLoad?.status === 'exact' && (
              <div className="mt-3">
                <Barbell bar={last.bar} combination={lastLoad.combinations[0] ?? []} />
                <p className="num mt-4 mb-2 text-body font-medium">
                  Por lado{' '}
                  <span className="font-normal text-muted">· {formatKg(lastLoad.perSide)} kg</span>
                </p>
                <PlateChips combination={lastLoad.combinations[0] ?? []} />
              </div>
            )}
            {last.type === 'strength' && (
              <p className="num mt-1 text-body text-muted">
                Peso de referencia, con la barra de {formatKg(last.bar)} kg.
              </p>
            )}
            {lastLoad && lastLoad.status !== 'exact' && (
              <p className="mt-2 text-body text-muted">
                Con el inventario actual esta carga no se arma exacta. Abrila para ver las más
                cercanas.
              </p>
            )}
            <Button variant="primary" className="mt-5" onClick={() => openEntry(last)}>
              Retomar
            </Button>
          </Panel>

          {recent.length > 0 && (
            <Panel>
              <div className="flex items-baseline justify-between gap-3">
                <PanelTitle>Anteriores</PanelTitle>
                <a href="#historial" className="text-body font-medium underline-offset-4 hover:underline">
                  Ver los {history.length}
                </a>
              </div>
              <ul className="mt-2">
                {recent.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => openEntry(entry)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="num block truncate text-body font-medium">
                          {describeEntry(entry)}
                        </span>
                        <span className="num block truncate text-[13px] leading-[18px] text-muted">
                          {MODULE_NAMES[entry.type]} · {formatWhen(entry.date)}
                        </span>
                      </span>
                      <span className="num flex-none text-section font-semibold">
                        {formatLoad(entry.target)}
                        <span className="pl-1 text-body font-normal text-muted">kg</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <div className="grid gap-[14px] md:col-span-5">
          <Panel>
            <PanelTitle>Módulos</PanelTitle>
            <div className="mt-2">{modules()}</div>
          </Panel>
          {box()}
        </div>
      </div>
    </>
  );
}
