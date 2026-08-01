import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';
import Button from '../../../../components/common/Button';
import { useBusinesses } from '../../../../contexts/BusinessContext';

export default function BusinessModal({ open, onClose, business }) {
  const { updateBusiness, plans, statuses, cities } = useBusinesses();
  const { register, handleSubmit, reset } = useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) reset(business || {});
  }, [open, business]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    updateBusiness(business.id, data);
    toast.success('Business updated');
    setSaving(false);
    onClose();
  };

  if (!business) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit business" subtitle={business.name} width={480}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={saving} onClick={handleSubmit(onSubmit)}>Save changes</Button>
      </>}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Business name</label>
          <input className="form-input" {...register('name', { required: true })} />
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Owner</label>
            <input className="form-input" {...register('owner', { required: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <select className="form-select" {...register('city')}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" {...register('email', { required: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" {...register('phone', { required: true })} />
          </div>
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-select" {...register('plan')}>
              {plans.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
