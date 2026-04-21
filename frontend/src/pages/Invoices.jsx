import { useEffect, useState } from 'react';
import api from '../api/client';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/invoices');
        if (!cancel) setRows(data);
      } catch (e) {
        if (!cancel) setError(e.response?.data?.message || 'Failed to load invoices');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Invoices</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {!rows.length && !error && <p className="text-muted">No invoices found.</p>}
      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order #</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total due</th>
                <th>Status</th>
                <th>Issued</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.orderNumber}</td>
                  <td>{formatMoney(inv.subtotal)}</td>
                  <td>{formatMoney(inv.taxAmount)}</td>
                  <td>{formatMoney(inv.totalDue)}</td>
                  <td>
                    <span className="badge bg-info text-dark">{inv.status}</span>
                  </td>
                  <td>{new Date(inv.issuedAt).toLocaleString()}</td>
                  <td>{new Date(inv.dueAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
