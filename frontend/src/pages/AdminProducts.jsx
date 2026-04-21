import { useEffect, useState } from 'react';
import api from '../api/client';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  price: '',
  stockQuantity: '0',
  category: '',
  active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
      category: p.category || '',
      active: p.active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      category: form.category.trim() || undefined,
      active: form.active,
    };
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      cancelEdit();
      await load();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    try {
      await api.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  };

  if (loading && !products.length) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Admin — Products</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header">{editingId ? `Edit product #${editingId}` : 'Create product'}</div>
        <div className="card-body">
          <form onSubmit={submit} className="row g-2">
            <div className="col-md-3">
              <label className="form-label">SKU</label>
              <input name="sku" className="form-control" value={form.sku} onChange={onChange} required />
            </div>
            <div className="col-md-5">
              <label className="form-label">Name</label>
              <input name="name" className="form-control" value={form.name} onChange={onChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Price</label>
              <input name="price" type="number" step="0.01" className="form-control" value={form.price} onChange={onChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Stock</label>
              <input name="stockQuantity" type="number" className="form-control" value={form.stockQuantity} onChange={onChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <input name="category" className="form-control" value={form.category} onChange={onChange} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Description</label>
              <input name="description" className="form-control" value={form.description} onChange={onChange} />
            </div>
            <div className="col-12 form-check">
              <input name="active" type="checkbox" className="form-check-input" id="active" checked={form.active} onChange={onChange} />
              <label className="form-check-label" htmlFor="active">
                Active (visible in catalogue)
              </label>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary ms-2" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table table-sm table-hover">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{formatMoney(p.price)}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.active ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
