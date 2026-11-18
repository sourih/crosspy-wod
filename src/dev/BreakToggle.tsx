import { FIXTURES } from './breakFixtures';

/** Solo desarrollo: selector de datos de prueba, abajo al centro. Recarga con ?data=. */
export function BreakToggle({ active }: { active: string }) {
  const go = (name: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('data', name);
    window.location.assign(url.toString());
  };
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 72,
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        width: 'max-content',
        maxWidth: 'calc(100vw - 16px)',
        padding: 3,
        borderRadius: 10,
        background: '#d4d4d4',
        font: '11px system-ui, sans-serif',
      }}
    >
      {Object.entries(FIXTURES).map(([name, fixture]) => (
        <button
          key={name}
          type="button"
          onClick={() => go(name)}
          style={{
            padding: '4px 8px',
            borderRadius: 7,
            border: 0,
            background: name === active ? '#fff' : 'transparent',
            color: '#111',
            cursor: 'pointer',
          }}
        >
          {fixture.label}
        </button>
      ))}
    </div>
  );
}
