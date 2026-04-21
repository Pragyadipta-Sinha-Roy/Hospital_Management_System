import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || '');
  const canManage = user && (user.role === 'ADMIN' || user.role === 'STAFF');

  useEffect(() => {
    if (location.state?.flash) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/orders');
        if (!cancel) setOrders(data);
      } catch (e) {
        if (!cancel) setError(e.response?.data?.message || 'Failed to load orders');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const patchStatus = async (orderId, status) => {
    setError('');
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update status');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Orders</h2>
      {flash && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {flash}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setFlash('')} />
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {!orders.length && !error && <p className="text-muted">No orders yet.</p>}
      {orders.length > 0 && (
        <div className="table-wrap">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>
                    {canManage ? (
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: '8rem' }}
                        value={o.status}
                        onChange={(e) => patchStatus(o.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="badge bg-secondary">{o.status}</span>
                    )}
                  </td>
                  <td>{formatMoney(o.totalAmount)}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.invoiceNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
