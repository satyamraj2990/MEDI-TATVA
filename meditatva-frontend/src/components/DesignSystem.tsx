import React from 'react';
import { motion } from 'framer-motion';

// Design System Color Tokens
export const DESIGN_TOKENS = {
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgTertiary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    bg: '#0B1220',
    bgSecondary: '#0F172A',
    bgTertiary: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  isDark?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color,
  isDark = false,
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        backgroundColor: theme.bgSecondary,
        borderColor: theme.border,
      }}
      className="p-6 rounded-lg border group cursor-pointer hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <p style={{ color: theme.textSecondary }} className="text-sm font-medium">
          {label}
        </p>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p style={{ color: theme.text }} className="text-2xl font-bold">
          {value}
        </p>
        {trend && (
          <span style={{ color: trend.includes('-') ? '#EF4444' : '#10B981' }} className="text-sm font-semibold">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark?: boolean;
  onHover?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  isDark = false,
  onHover,
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onHoverStart={onHover}
      style={{
        backgroundColor: theme.bgSecondary,
        borderColor: theme.border,
      }}
      className="p-8 rounded-xl border hover:border-blue-500 transition-colors group cursor-pointer"
    >
      <motion.div
        className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {icon}
      </motion.div>

      <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p style={{ color: theme.textSecondary }} className="text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

// Alert Component
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  isDark?: boolean;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  isDark = false,
  onClose,
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;
  const colors = {
    success: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
    warning: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    error: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    info: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  };

  const alertColors = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        backgroundColor: alertColors.bg,
        borderColor: alertColors.border,
        color: alertColors.text,
      }}
      className="p-4 rounded-lg border flex items-start gap-3"
    >
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg leading-none hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </motion.div>
  );
};

// Data Table Component
interface TableColumn {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  isDark?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  isDark = false,
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderColor: theme.border }} className="border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ color: theme.textSecondary }}
                className="text-left py-3 px-4 font-semibold"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{ borderColor: theme.border }}
              className="border-b hover:opacity-80 transition-opacity"
            >
              {columns.map((col) => (
                <td
                  key={`${rowIdx}-${col.key}`}
                  style={{ color: theme.text }}
                  className="py-4 px-4"
                >
                  {col.render ? col.render(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Badge Component
interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  isDark?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  isDark = false,
}) => {
  const badgeStyles = {
    success: {
      bg: '#DCFCE7',
      text: '#166534',
    },
    warning: {
      bg: '#FEF3C7',
      text: '#92400E',
    },
    error: {
      bg: '#FEE2E2',
      text: '#991B1B',
    },
    info: {
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    default: {
      bg: isDark ? '#1E293B' : '#F1F5F9',
      text: isDark ? '#CBD5E1' : '#475569',
    },
  };

  const style = badgeStyles[variant];

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      className="px-3 py-1 rounded-full text-sm font-semibold"
    >
      {label}
    </span>
  );
};

// Loading Skeleton
interface SkeletonProps {
  isDark?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  isDark = false,
  className = 'h-12 w-full',
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;

  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ backgroundColor: theme.bgTertiary }}
      className={`rounded-lg ${className}`}
    />
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDark?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isDark = false,
  footer,
}) => {
  const theme = isDark ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
        className="rounded-lg border max-w-md w-full overflow-hidden"
      >
        <div
          style={{
            backgroundColor: theme.bgSecondary,
            borderColor: theme.border,
          }}
          className="p-6 border-b flex items-center justify-between"
        >
          <h2 style={{ color: theme.text }} className="text-lg font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ color: theme.textSecondary }}
            className="hover:opacity-100 opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
            className="p-6 border-t flex gap-3 justify-end"
          >
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default {
  DESIGN_TOKENS,
  StatCard,
  FeatureCard,
  Alert,
  DataTable,
  Badge,
  Skeleton,
  Modal,
};
