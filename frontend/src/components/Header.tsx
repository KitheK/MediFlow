import React from 'react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, onLogout }) => {
 
  const sections = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "appointments", label: "Appointments", icon: "fas fa-calendar-check" },
    { id: "doctors", label: "Doctors", icon: "fas fa-user-md" },
  ];
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'patients', label: 'Patients', icon: 'fas fa-users' },
    { id: 'appointments', label: 'Appointments', icon: 'fas fa-calendar-check' },
    { id: 'doctors', label: 'Doctors', icon: 'fas fa-user-md' }
  ];

 return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          <h1>MediFlow</h1>
        </div>
        <nav className="nav">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`nav-link ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(section.id);
              }}
            >
              <i className={section.icon}></i>
              {section.label}
            </a>
          ))}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;