/**
 * Reusable form controls with consistent styling + Urdu RTL support
 */
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export function Input({ label, icon: Icon, ...props }) {
  const isPassword = props.type === 'password';
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? 'text' : 'password') : props.type;
  const padRight = isPassword ? 'pr-10 rtl:pl-10 rtl:pr-4' : 'pr-4';

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
        <input
          {...props}
          type={inputType}
          className={`w-full ${Icon ? 'pl-10 rtl:pr-10 rtl:pl-4' : 'pl-4'} ${padRight} py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-50 ${props.className || ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function Select({ label, icon: Icon, options = [], ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />}
        <select
          {...props}
          className={`w-full ${Icon ? 'pl-10 rtl:pr-10 rtl:pl-4' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-50 ${props.className || ''}`}
        >
          {options.map((o, i) => (
            <option key={i} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <textarea
        {...props}
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white resize-none ${props.className || ''}`}
      />
    </div>
  );
}

export function Button({ children, loading, icon: Icon, variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${props.className || ''}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = '', title, icon: Icon, badge }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-green-600" />}
            {title}
          </h3>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatBox({ label, value, color = 'green', subtitle, icon: Icon }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium opacity-70">{label}</p>
        {Icon && <Icon size={16} className="opacity-60" />}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
    </div>
  );
}
