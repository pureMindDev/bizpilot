import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { useCustomers } from '../../../contexts/CustomerContext';
import { extractErrorMessage } from '../../../utils/apiError';

const cities = ['Lagos', 'Abuja', 'Osogbo', 'Ibadan', 'Port Harcourt', 'Kano', 'Enugu', 'Benin City'];

export default function CustomerModal({ open, onClose, customer }) {
  const { addCustomer, updateCustomer } = useCustomers();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!customer;

  useEffect(() => {
    if (open) reset(customer || { city: cities[0] });
  }, [open, customer]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateCustomer(customer.id, data);
        toast.success('Customer updated');
      } else {
        await addCustomer(data);
        toast.success('Customer added');
      }
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit customer' : 'Add new customer'} width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit(onSubmit)}>{isEdit ? 'Save changes' : 'Add customer'}</Button>
        </>
      }>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" placeholder="e.g. Adaeze Okafor" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="email@example.com" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="08012345678" {...register('phone', { required: 'Phone is required' })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <select className="form-select" {...register('city')}>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" rows={3} placeholder="Any additional notes about this customer..." {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
