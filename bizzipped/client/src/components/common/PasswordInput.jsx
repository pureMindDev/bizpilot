import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PasswordInput({ register, name, rules, placeholder = 'Enter your password', ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        className="form-input"
        placeholder={placeholder}
        style={{ paddingRight: 42 }}
        {...(register ? register(name, rules) : {})}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--text-tertiary)', display: 'flex',
        }}
      >
        {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
      </button>
    </div>
  );
}
