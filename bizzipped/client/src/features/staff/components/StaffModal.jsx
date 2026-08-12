import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import PlanLimitModal from '../../../components/common/PlanLimitModal';
import { useStaff } from '../../../contexts/StaffContext';
import { extractErrorMessage, getPlanLimitDetails } from '../../../utils/apiError';

export default function StaffModal({ open, onClose, staffMember }) {
  const { addStaff, updateStaff, roles, rolePermissions } = useStaff();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const [limitDetails, setLimitDetails] = useState(null);
  const isEdit = !!staffMember;
  const selectedRole = watch('role');

  useEffect(() => {
    if (open) reset(staffMember || { role: roles[2] });
  }, [open, staffMember]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateStaff(staffMember.id, data);
        toast.success('Staff member updated');
      } else {
        await addStaff(data);
        toast.success('Staff member added — temporary password: bizpilot123');
      }
      onClose();
    } catch (err) {
      const limit = getPlanLimitDetails(err);
      if (limit) {
        onClose();
        setLimitDetails(limit);
      } else {
        toast.error(extractErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit staff member' : 'Add staff member'} width={480}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={saving} onClick={handleSubmit(onSubmit)}>{isEdit ? 'Save changes' : 'Add staff'}</Button>
      </>}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" placeholder="e.g. Grace Adebayo" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="staff@bizpilot.ng" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="08012345678" {...register('phone', { required: 'Phone is required' })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" {...register('role', { required: true })}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {selectedRole && (
          <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Permissions for {selectedRole}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {rolePermissions[selectedRole]?.map((p) => <span key={p} className="badge badge-info">{p}</span>)}
            </div>
          </div>
        )}
      </form>
    </Modal>
    <PlanLimitModal details={limitDetails} onClose={() => setLimitDetails(null)} />
    </>
  );
}
