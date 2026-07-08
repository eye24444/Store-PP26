// Wraps a wide table/grid so it scrolls horizontally on narrow screens instead
// of squishing its columns. `minWidth` keeps the columns at a readable size.
export default function ScrollX({ minWidth = 700, children, style }) {
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
