import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo_dark.png" alt="Teleton" style={{ height: '32px' }} />
        </div>
        <nav>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/tools" className={isActive('/tools') ? 'active' : ''}>
            Tools
          </Link>
          <Link to="/plugins" className={isActive('/plugins') ? 'active' : ''}>
            Plugins
          </Link>
          <Link to="/soul" className={isActive('/soul') ? 'active' : ''}>
            Soul
          </Link>
          <Link to="/memory" className={isActive('/memory') ? 'active' : ''}>
            Memory
          </Link>
          <Link to="/logs" className={isActive('/logs') ? 'active' : ''}>
            Logs
          </Link>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
