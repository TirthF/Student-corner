/** Maps status/type values to badge class names */
export const STATUS_CLASS = {
  pending:    'badge badge-pending',
  published:  'badge badge-published',
  rejected:   'badge badge-rejected',
  admin:      'badge badge-admin',
  faculty:    'badge badge-faculty',
  student:    'badge badge-student',
  General:    'badge badge-general',
  Dept:       'badge badge-dept',
  Event:      'badge badge-event',
  Placement:  'badge badge-placement',
  note:       'badge badge-note',
  pyq:        'badge badge-pyq',
  ppt:        'badge badge-ppt',
  labmanual:  'badge badge-labmanual',
  project:    'badge badge-project',
};

export const STATUS_LABEL = {
  pending:    'Pending',
  published:  'Published',
  rejected:   'Rejected',
  note:       'Notes',
  pyq:        'PYQ',
  ppt:        'PPT',
  labmanual:  'Lab Manual',
  project:    'Project',
};

export default function StatusBadge({ value }) {
  const cls = STATUS_CLASS[value] || 'badge badge-general';
  const label = STATUS_LABEL[value] || value;
  return <span className={cls}>{label}</span>;
}
