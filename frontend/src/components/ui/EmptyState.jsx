/** Generic empty state component per UI/UX spec */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: 16,
          color: 'var(--color-text-muted)',
          lineHeight: 1,
        }}
      >
        {icon || '📭'}
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360, lineHeight: 1.6, marginBottom: action ? 20 : 0 }}>
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
