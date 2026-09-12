import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { api, decodeToken } from "./api";

/* =========================
   HELPERS
========================= */

function calculateAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function genderLabel(g) {
  if (g === "M") return "Male";
  if (g === "F") return "Female";
  return g || "";
}

function fullName(p) {
  return `${p.first_name} ${p.last_name}`;
}

/* =========================
   APP
========================= */

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload) return null;
    return {
      role: payload.role,
      username: localStorage.getItem("username") || "",
    };
  });

  const [selectedPatient, setSelectedPatient] = useState(null);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setSelectedPatient(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      selectedPatient={selectedPatient}
      setSelectedPatient={setSelectedPatient}
      onLogout={handleLogout}
    />
  );
}

/* =========================
   LOGIN
========================= */

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", username);
      const payload = decodeToken(data.access_token);
      onLogin({ role: payload.role, username });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">+</div>
          <h1>MedRecord</h1>
        </div>

        <p className="login-subtitle">
          Patient Vaccination Management System
        </p>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
              {error}
            </p>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({ user, selectedPatient, setSelectedPatient, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const isReceptionist = user.role === "RECEPTIONIST";

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      fullName(p).toLowerCase().includes(q) ||
      (p.phone_number || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">+</div>
          <span>MedRecord</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar">
            {user.role === "DOCTOR" ? "D" : "R"}
          </div>
          <div>
            <strong>{user.username}</strong>
            <span>{user.role.toLowerCase()}</span>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>▣</span>
            Patients
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Patients</h1>
            <p>
              {isReceptionist
                ? "Manage patient records and vaccination history."
                : "Search and view patient records."}
            </p>
          </div>

          {isReceptionist && (
            <button
              className="primary-button"
              onClick={() => setShowAddPatient(true)}
            >
              + Add Patient
            </button>
          )}
        </header>

        <section className="search-section">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="patient-count">
            {filteredPatients.length} patient
            {filteredPatients.length !== 1 ? "s" : ""}
          </span>
        </section>

        <section className="patient-table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="empty">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="5" className="empty">
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.patient_id}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <td>
                      <div className="patient-name">
                        <div className="small-avatar">
                          {patient.first_name.charAt(0)}
                        </div>
                        {fullName(patient)}
                      </div>
                    </td>
                    <td>{calculateAge(patient.date_of_birth)}</td>
                    <td>{genderLabel(patient.gender)}</td>
                    <td>{patient.phone_number}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                        }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && !error && filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* PATIENT DETAILS MODAL */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          user={user}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* ADD PATIENT MODAL */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onAdded={() => {
            setShowAddPatient(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}

/* =========================
   PATIENT MODAL
========================= */

function PatientModal({ patient, user, onClose }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVaccination, setShowAddVaccination] = useState(false);

  const loadVaccinations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVaccinations(patient.patient_id);
      setVaccinations(data);
    } catch {
      setVaccinations([]);
    } finally {
      setLoading(false);
    }
  }, [patient.patient_id]);

  useEffect(() => {
    loadVaccinations();
  }, [loadVaccinations]);

  function downloadPatient() {
    const record = { ...patient, vaccinations };
    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullName(patient).replace(/\s+/g, "_")}-record.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const isDoctor = user.role === "DOCTOR";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-label">PATIENT RECORD</span>
            <h2>{fullName(patient)}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="patient-info-grid">
          <InfoItem label="Full Name" value={fullName(patient)} />
          <InfoItem label="Date of Birth" value={patient.date_of_birth} />
          <InfoItem label="Age" value={calculateAge(patient.date_of_birth)} />
          <InfoItem label="Gender" value={genderLabel(patient.gender)} />
          <InfoItem label="Nationality" value={patient.nationality} />
          <InfoItem label="Phone" value={patient.phone_number} />
          <InfoItem
            label="Passport Number"
            value={patient.passport_number || "Not provided"}
          />
        </div>

        <div className="vaccination-section">
          <div className="section-heading">
            <div>
              <h3>Vaccination History</h3>
              <p>Patient vaccination records</p>
            </div>

            <div className="vaccination-actions">
              <span className="vaccination-count">
                {vaccinations.length} records
              </span>

              {isDoctor && (
                <button
                  className="add-vaccine-button"
                  onClick={() => setShowAddVaccination(true)}
                >
                  + Add Vaccination
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="no-vaccinations">Loading...</div>
          ) : vaccinations.length > 0 ? (
            <table className="vaccination-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Manufacturer</th>
                  <th>Date</th>
                  <th>Next Booster</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map((v) => (
                  <tr key={v.vaccination_id}>
                    <td>{v.vaccine}</td>
                    <td>{v.manufacturer}</td>
                    <td>{v.date_of_vaccination}</td>
                    <td>{v.next_booster_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-vaccinations">
              No vaccination records available.
              {isDoctor && (
                <button
                  className="add-vaccine-link"
                  onClick={() => setShowAddVaccination(true)}
                >
                  Add the first vaccination
                </button>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button className="primary-button" onClick={downloadPatient}>
            ↓ Download Record
          </button>
        </div>
      </div>

      {showAddVaccination && (
        <AddVaccinationModal
          patientId={patient.patient_id}
          onClose={() => setShowAddVaccination(false)}
          onAdded={() => {
            setShowAddVaccination(false);
            loadVaccinations();
          }}
        />
      )}
    </div>
  );
}

/* =========================
   ADD VACCINATION MODAL
========================= */

function AddVaccinationModal({ patientId, onClose, onAdded }) {
  const [form, setForm] = useState({
    vaccine: "",
    date_of_vaccination: "",
    manufacturer: "",
    next_booster_date: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createVaccination({
        patient_id: patientId,
        vaccine: form.vaccine,
        date_of_vaccination: form.date_of_vaccination,
        manufacturer: form.manufacturer,
        next_booster_date: form.next_booster_date || null,
      });
      onAdded();
    } catch (err) {
      setError(err.message || "Could not add vaccination");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay vaccination-overlay" onClick={onClose}>
      <div className="vaccination-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-label">DOCTOR</span>
            <h2>Add Vaccination</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="vaccination-form">
            <div className="form-field">
              <label>Vaccine</label>
              <input
                required
                type="text"
                placeholder="e.g. COVID-19"
                value={form.vaccine}
                onChange={(e) => updateField("vaccine", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Manufacturer</label>
              <input
                required
                type="text"
                placeholder="e.g. Pfizer"
                value={form.manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Vaccination Date</label>
              <input
                required
                type="date"
                value={form.date_of_vaccination}
                onChange={(e) =>
                  updateField("date_of_vaccination", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>
                Next Booster Date
                <span className="optional"> (Optional)</span>
              </label>
              <input
                type="date"
                value={form.next_booster_date}
                onChange={(e) =>
                  updateField("next_booster_date", e.target.value)
                }
              />
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Add Vaccination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   INFO ITEM
========================= */

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================
   ADD PATIENT MODAL
========================= */

function AddPatientModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "M",
    date_of_birth: "",
    nationality: "",
    phone_number: "",
    passport_number: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createPatient({
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        nationality: form.nationality,
        phone_number: form.phone_number,
        passport_number: form.passport_number.trim() || null,
      });
      onAdded();
    } catch (err) {
      setError(err.message || "Could not add patient");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-label">RECEPTIONIST</span>
            <h2>Add New Patient</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>First Name</label>
              <input
                required
                placeholder="Enter first name"
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Last Name</label>
              <input
                required
                placeholder="Enter last name"
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Date of Birth</label>
              <input
                required
                type="date"
                value={form.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div className="form-field">
              <label>Nationality</label>
              <input
                required
                placeholder="e.g. Egyptian"
                value={form.nationality}
                onChange={(e) => updateField("nationality", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Phone Number</label>
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={form.phone_number}
                onChange={(e) => updateField("phone_number", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>
                Passport Number
                <span className="optional"> (Optional)</span>
              </label>
              <input
                placeholder="Enter passport number"
                value={form.passport_number}
                onChange={(e) =>
                  updateField("passport_number", e.target.value)
                }
              />
            </div>
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, padding: "0 30px" }}>
              {error}
            </p>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
