import { COLORS, DARK_TEXT } from '../utils/gameLogic';

export default function RouteBullet({ route, small = false, style }) {
  return (
    <div
      className={`bullet${small ? ' sm' : ''}${DARK_TEXT.has(route) ? ' dark' : ''}`}
      style={{ background: COLORS[route] || '#666', ...style }}
    >
      {route}
    </div>
  );
}
