import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((n, x) => n + x.quantity, 0);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Hospital Business Ops
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#nav"
            aria-controls="nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/products">
                  Products
                </NavLink>
              </li>
              {user && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/orders">
                      Orders
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/invoices">
                      Invoices
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/profile">
                      Profile
                    </NavLink>
                  </li>
                  {user.role === 'ADMIN' && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/products">
                        Admin products
                      </NavLink>
                    </li>
                  )}
                </>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2">
              <Link className="btn btn-outline-light btn-sm position-relative" to="/cart">
                Cart
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <span className="text-white-50 small d-none d-md-inline">{user.username}</span>
                  <button type="button" className="btn btn-light btn-sm" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-light btn-sm" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-light btn-sm" to="/register">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="border-top mt-5 py-4 text-muted small">
        <div className="container text-center">
          Hospital supply &amp; billing demo — Spring Boot, React, MySQL
        </div>
      </footer>
    </>
  );
}
