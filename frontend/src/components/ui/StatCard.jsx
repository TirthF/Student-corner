/** Reusable stat card for dashboards */
export default function StatCard({ icon, label, value, color = 'primary', onClick }) {
  const colorMap = {
    primary: { bg: 'var(--color-primary-subtle)', icon: 'var(--color-primary)' },
    success: { bg: 'var(--color-success-bg)',     icon: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-bg)',     icon: 'var(--color-warning)' },
    danger:  { bg: 'var(--color-danger-bg)',      icon: 'var(--color-danger)' },
    secondary:{ bg: 'var(--color-secondary-light)', icon: 'var(--color-secondary)' },
  };
  const colors = colorMap[color] || colorMap.primary;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'box-shadow 0.2s',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: colors.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: colors.icon, flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
    </div>
  );
}
