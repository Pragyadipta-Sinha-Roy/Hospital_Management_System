import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="row align-items-center py-lg-5">
      <div className="col-lg-7">
        <h1 className="display-5 fw-bold mb-3">Operations for supplies, customers, and billing</h1>
        <p className="lead text-muted">
          Browse products, place orders as a customer, and track invoices. Staff and administrators can manage
          catalogues and order status.
        </p>
        <Link className="btn btn-primary btn-lg me-2" to="/products">
          Browse products
        </Link>
        <Link className="btn btn-outline-secondary btn-lg" to="/register">
          Create account
        </Link>
      </div>
      <div className="col-lg-5 mt-4 mt-lg-0">
        <div className="card border-0 shadow-sm bg-white">
          <div className="card-body p-4">
            <h5 className="card-title">Demo accounts</h5>
            <ul className="small mb-0 text-muted">
              <li>
                <strong>admin</strong> / Admin#12345 — full product CRUD
              </li>
              <li>
                <strong>staff</strong> / Staff#12345 — orders &amp; customers
              </li>
              <li>Register a new customer to shop and checkout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
