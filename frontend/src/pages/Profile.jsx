import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { data: me } = await api.get('/api/customers/me');
        if (!cancel) {
          setData(me);
          setForm({
            firstName: me.firstName || '',
            lastName: me.lastName || '',
            phone: me.phone || '',
            address: me.address || '',
          });
        }
      } catch (e) {
        if (!cancel) setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (user?.role !== 'CUSTOMER') {
      setError('Only customer accounts can update this profile.');
      return;
    }
    setSaving(true);
    try {
      const { data: me } = await api.put('/api/customers/me', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setData(me);
      setOk('Profile saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
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
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h2 className="mb-3">Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {ok && <div className="alert alert-success">{ok}</div>}
        {data && (
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <p className="mb-1">
                <strong>Username:</strong> {data.username}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {data.email}
              </p>
              <p className="mb-0">
                <strong>Role:</strong> {data.role}
              </p>
            </div>
          </div>
        )}
        {user?.role === 'CUSTOMER' ? (
          <form onSubmit={onSubmit}>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className="form-control"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  className="form-control"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  className="form-control"
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        ) : (
          <p className="text-muted">Staff and admin accounts do not have an editable customer profile here.</p>
        )}
      </div>
    </div>
  );
}
