import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (items.length === 0) {
      setError('Cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const lines = items.map((x) => ({
        productId: x.product.id,
        quantity: x.quantity,
      }));
      const { data } = await api.post('/api/orders', { lines });
      clear();
      navigate(`/orders`, { replace: true, state: { flash: `Order ${data.orderNumber} placed.` } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      setError(data?.message || err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <h2>Checkout</h2>
        <p className="text-muted">Nothing to checkout.</p>
        <Link to="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-lg-7">
        <h2>Checkout</h2>
        <p className="text-muted">Confirm your order. Tax and invoice are calculated on the server.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="alert alert-warning">
            <ul className="mb-0 small">
              {Object.entries(fieldErrors).map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={submit}>
          <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </div>
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-header">Summary</div>
          <ul className="list-group list-group-flush">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="list-group-item d-flex justify-content-between">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatMoney(Number(product.price) * quantity)}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Subtotal (cart)</span>
              <span>{formatMoney(total)}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
