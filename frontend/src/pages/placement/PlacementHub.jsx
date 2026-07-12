import { ExternalLink, Briefcase } from 'lucide-react';

// Static placement data for P0 (P1 will make this dynamic via DB)
const COMPANIES = [
  {
    name: 'TCS (Tata Consultancy Services)',
    package: '3.5 – 7 LPA',
    eligibility: 'CGPA ≥ 6.0, No active backlogs',
    roles: ['System Engineer', 'Digital Analyst', 'Ninja (High Performer Track)'],
    rounds: ['Online Test (NQT)', 'Technical Interview', 'HR Interview'],
    link: 'https://www.tcs.com/careers',
    badge: 'Mass Recruiter',
    color: '#0B3D91',
  },
  {
    name: 'Infosys',
    package: '3.6 – 8 LPA',
    eligibility: 'CGPA ≥ 6.0, No active backlogs',
    roles: ['Systems Engineer', 'Technology Analyst'],
    rounds: ['Online Aptitude Test', 'Verbal Ability Test', 'HR'],
    link: 'https://www.infosys.com/careers',
    badge: 'Mass Recruiter',
    color: '#007CC3',
  },
  {
    name: 'Wipro',
    package: '3.5 – 6.5 LPA',
    eligibility: 'CGPA ≥ 6.0, No active backlogs',
    roles: ['Project Engineer', 'Software Developer'],
    rounds: ['WILP Test', 'Essay Writing', 'HR Interview'],
    link: 'https://careers.wipro.com',
    badge: 'Mass Recruiter',
    color: '#341A6E',
  },
  {
    name: 'L&T Technology Services',
    package: '4.5 – 9 LPA',
    eligibility: 'CGPA ≥ 7.0, No backlogs',
    roles: ['Software Developer', 'Embedded Engineer'],
    rounds: ['Aptitude', 'Technical', 'Managerial', 'HR'],
    link: 'https://www.ltts.com/careers',
    badge: 'Core Engineering',
    color: '#D00000',
  },
  {
    name: 'Jio Platforms',
    package: '5 – 12 LPA',
    eligibility: 'CGPA ≥ 7.5, CE/IT/EC preferred',
    roles: ['Software Engineer', 'Network Engineer'],
    rounds: ['Online Test', 'Technical Interview x2', 'HR'],
    link: 'https://www.jio.com/en-in/about-jio/careers',
    badge: 'Product',
    color: '#0A6EBD',
  },
  {
    name: 'Tata Motors',
    package: '4 – 8 LPA',
    eligibility: 'CGPA ≥ 6.5, ME preferred',
    roles: ['Graduate Engineer Trainee', 'Product Engineer'],
    rounds: ['GATE Score / Aptitude', 'Technical', 'HR'],
    link: 'https://www.tatamotors.com/careers',
    badge: 'Core Engineering',
    color: '#1D4E89',
  },
];

export default function PlacementHub() {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 6 }}>
          <Briefcase size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--color-primary)' }} />
          Placement Hub
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Companies that recruit from ADIT — packages, eligibility, and prep resources.
          Interview experience submissions coming in P1.
        </p>
      </div>

      <div className="grid-3" style={{ gap: 20 }}>
        {COMPANIES.map((c) => (
          <div key={c.name} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Color header */}
            <div style={{ background: c.color, padding: '20px 20px 16px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{c.name}</h3>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '2px 10px', fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {c.badge}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: '1.25rem', fontWeight: 700 }}>{c.package}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Package range</div>
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 20px', flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  Eligibility
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{c.eligibility}</p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Roles Offered
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {c.roles.map((r) => (
                    <span key={r} style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem' }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Selection Process
                </p>
                <ol style={{ paddingLeft: 16, margin: 0 }}>
                  {c.rounds.map((round, i) => (
                    <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                      {round}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm btn-full"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={13} /> View Careers Page
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>
          <strong>📌 Note:</strong> Package ranges and eligibility criteria are indicative based on recent ADIT placements and may change each year.
          Interview experience submissions (P1 feature) will let you read first-hand accounts from placed seniors.
        </p>
      </div>
    </div>
  );
}
