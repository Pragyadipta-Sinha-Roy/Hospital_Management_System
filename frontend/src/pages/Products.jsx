import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

export default function Products() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/products');
        setCategories([...new Set(data.map((p) => p.category).filter(Boolean))]);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (category) params.category = category;
      const { data } = await api.get('/api/products', { params });
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <h2 className="mb-3">Products</h2>
      <form className="row g-2 mb-4" onSubmit={onSearch}>
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Search name, SKU, description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-3">
          {list.map((p) => (
            <div key={p.id} className="col-md-4">
              <div className="card h-100 card-product">
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-secondary align-self-start mb-2">{p.category || '—'}</span>
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text small text-muted text-truncate-3" style={{ minHeight: '3rem' }}>
                    {p.description || 'No description'}
                  </p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong>{formatMoney(p.price)}</strong>
                    <span className="small text-muted">Stock: {p.stockQuantity}</span>
                  </div>
                  <Link className="btn btn-outline-primary mt-3" to={`/products/${p.id}`}>
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
