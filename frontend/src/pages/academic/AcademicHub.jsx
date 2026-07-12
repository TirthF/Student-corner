import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SubjectPage from './SubjectPage';
import { ChevronRight } from 'lucide-react';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const BRANCHES = ['CE', 'IT', 'EC', 'ME', 'Civil'];

// Sample subject list per branch+semester (real app would fetch from DB, but
// for P0 we use a curated static list as a scaffold)
const SUBJECTS = {
  CE: {
    1: ['Mathematics-I', 'Physics', 'Basic Electronics', 'Engineering Drawing', 'Communication Skills'],
    2: ['Mathematics-II', 'Chemistry', 'Workshop Practice', 'Environmental Science', 'C Programming'],
    3: ['Data Structures', 'Digital Electronics', 'DBMS', 'Object Oriented Programming', 'Discrete Maths'],
    4: ['Analysis of Algorithms', 'Computer Networks', 'OS', 'Software Engineering', 'Microprocessors'],
    5: ['Compiler Design', 'Distributed Systems', 'ML Fundamentals', 'Web Technologies', 'Computer Graphics'],
    6: ['Cloud Computing', 'Information Security', 'Big Data', 'Mobile Computing', 'IoT'],
    7: ['Advanced Algorithms', 'Deep Learning', 'Elective-I', 'Project Phase-I', 'Seminar'],
    8: ['Project Phase-II', 'Elective-II', 'Industrial Training'],
  },
  IT: {
    1: ['Mathematics-I', 'Physics', 'Basic Electronics', 'Engineering Drawing', 'Communication Skills'],
    2: ['Mathematics-II', 'Chemistry', 'Workshop Practice', 'Environmental Science', 'C Programming'],
    3: ['Data Structures', 'Digital Electronics', 'DBMS', 'OOP with Java', 'Discrete Maths'],
    4: ['Analysis of Algorithms', 'Computer Networks', 'OS', 'Software Engineering', 'Internet Technologies'],
    5: ['Information Theory', 'Network Security', 'Data Warehousing', 'Web Services', 'Python'],
    6: ['Cloud Infrastructure', 'Cyber Security', 'Big Data Analytics', 'Mobile App Dev', 'IoT'],
    7: ['Machine Learning', 'Natural Language Processing', 'Elective-I', 'Project Phase-I', 'Seminar'],
    8: ['Project Phase-II', 'Elective-II', 'Industrial Training'],
  },
  EC: {
    1: ['Mathematics-I', 'Physics', 'Basic Electronics', 'Engineering Drawing', 'Communication Skills'],
    2: ['Mathematics-II', 'Chemistry', 'Workshop Practice', 'Environmental Science', 'C Programming'],
    3: ['Analog Electronics', 'Signals & Systems', 'Network Theory', 'Electronic Devices', 'Electromagnetics'],
    4: ['Digital Communication', 'Control Systems', 'Microprocessors', 'VLSI Design', 'DSP'],
    5: ['Advanced Communication', 'Antenna Theory', 'Embedded Systems', 'Optical Fiber', 'Satellite Comm'],
    6: ['Wireless Networks', 'RF Design', 'MEMS', 'Image Processing', 'IoT'],
    7: ['5G Technology', 'Radar Systems', 'Elective-I', 'Project Phase-I', 'Seminar'],
    8: ['Project Phase-II', 'Elective-II', 'Industrial Training'],
  },
  ME: {
    1: ['Mathematics-I', 'Physics', 'Basic Mechanical', 'Engineering Drawing', 'Communication Skills'],
    2: ['Mathematics-II', 'Chemistry', 'Workshop Practice', 'Environmental Science', 'C Programming'],
    3: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing Processes', 'Material Science', 'Machine Drawing'],
    4: ['Heat Transfer', 'Theory of Machines', 'Strength of Materials', 'CAD/CAM', 'Industrial Engineering'],
    5: ['Design of Machine Elements', 'Refrigeration & AC', 'Mechatronics', 'Advanced Manufacturing', 'Automobile Engineering'],
    6: ['Robotics', 'FEM', 'Quality Control', 'Operations Research', 'Power Plant Engineering'],
    7: ['Advanced Thermodynamics', 'Nanotechnology', 'Elective-I', 'Project Phase-I', 'Seminar'],
    8: ['Project Phase-II', 'Elective-II', 'Industrial Training'],
  },
  Civil: {
    1: ['Mathematics-I', 'Physics', 'Basic Civil Engineering', 'Engineering Drawing', 'Communication Skills'],
    2: ['Mathematics-II', 'Chemistry', 'Workshop Practice', 'Environmental Science', 'C Programming'],
    3: ['Structural Analysis-I', 'Fluid Mechanics', 'Surveying', 'Building Materials', 'Geotechnical Engineering'],
    4: ['Structural Analysis-II', 'Concrete Technology', 'Transportation Engineering', 'Water Resources', 'Foundation Engineering'],
    5: ['Design of RCC Structures', 'Steel Design', 'Environmental Engineering', 'Urban Planning', 'GIS'],
    6: ['Advanced Structural Design', 'Bridge Engineering', 'Irrigation Engineering', 'Construction Management', 'Remote Sensing'],
    7: ['Earthquake Engineering', 'Traffic Engineering', 'Elective-I', 'Project Phase-I', 'Seminar'],
    8: ['Project Phase-II', 'Elective-II', 'Industrial Training'],
  },
};

export default function AcademicHub() {
  const { dbUser } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Breadcrumb reset helpers
  const resetToSemester = () => { setSelectedBranch(null); setSelectedSubject(null); };
  const resetToBranch = () => { setSelectedSubject(null); };

  // If a subject is selected, show the resource view
  if (selectedSubject) {
    return (
      <SubjectPage
        semester={selectedSemester}
        branch={selectedBranch}
        subject={selectedSubject}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: `Semester ${selectedSemester}`, onClick: () => { setSelectedSemester(null); resetToSemester(); } },
              { label: selectedBranch, onClick: () => resetToBranch() },
              { label: selectedSubject },
            ]}
          />
        }
        onBack={resetToBranch}
      />
    );
  }

  // Branch → Subject selection
  if (selectedSemester && selectedBranch) {
    const subjects = SUBJECTS[selectedBranch]?.[selectedSemester] || [];
    return (
      <div className="fade-in">
        <Breadcrumb
          items={[
            { label: `Semester ${selectedSemester}`, onClick: () => { setSelectedSemester(null); resetToSemester(); } },
            { label: selectedBranch },
          ]}
        />
        <h1 style={{ fontWeight: 700, marginBottom: 8 }}>
          {selectedBranch} — Semester {selectedSemester}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28 }}>
          Select a subject to browse its resources.
        </p>

        {subjects.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 32 }}>
              No subjects configured for this semester yet.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📚</div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  {subject}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>View resources →</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Semester → Branch selection
  if (selectedSemester) {
    return (
      <div className="fade-in">
        <Breadcrumb items={[{ label: `Semester ${selectedSemester}` }]} />
        <h1 style={{ fontWeight: 700, marginBottom: 8 }}>Semester {selectedSemester}</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28 }}>
          Select your branch.{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Your branch: {dbUser?.branch || 'CE'}
          </span>
        </p>
        <div className="grid-3">
          {BRANCHES.map((branch) => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              style={{
                background: branch === (dbUser?.branch) ? 'var(--color-primary-subtle)' : 'var(--color-bg)',
                border: `1.5px solid ${branch === (dbUser?.branch) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏫</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: branch === dbUser?.branch ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                {branch}
              </h3>
              {branch === dbUser?.branch && (
                <span className="badge badge-primary" style={{ marginTop: 8, fontSize: '0.6875rem' }}>Your branch</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Semester picker (initial screen)
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 6 }}>📚 Academic Hub</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Browse notes, PYQs, PPTs, and lab manuals — organized by semester, branch, and subject.
        </p>
      </div>

      <div className="grid-4">
        {SEMESTERS.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            style={{
              background: sem === dbUser?.semester ? 'var(--color-primary)' : 'var(--color-bg)',
              color: sem === dbUser?.semester ? '#fff' : 'var(--color-text-primary)',
              border: `1.5px solid ${sem === dbUser?.semester ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '28px 20px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (sem !== dbUser?.semester) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
            onMouseLeave={(e) => { if (sem !== dbUser?.semester) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; } }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 8, filter: sem === dbUser?.semester ? 'brightness(1.2)' : '' }}>
              {['📖', '📝', '💡', '🔬', '🖥️', '🌐', '🚀', '🎓'][sem - 1]}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: sem === dbUser?.semester ? 0.9 : 0.6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semester
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{sem}</div>
            {sem === dbUser?.semester && (
              <div style={{ fontSize: '0.6875rem', marginTop: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '2px 8px' }}>
                Current
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: '0.875rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
      <span
        style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 500 }}
        onClick={() => window.location.reload()}
      >
        Academic Hub
      </span>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronRight size={14} />
          {item.onClick ? (
            <span style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 500 }} onClick={item.onClick}>
              {item.label}
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-primary)', fontWeight: i === items.length - 1 ? 600 : 400 }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
