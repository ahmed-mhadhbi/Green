import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TRACKS = [
  { key: "mentor", title: "Trainer registration", role: "mentor" },
  { key: "bso", title: "Business support organization registration", role: "business_support" },
  { key: "entrepreneur", title: "Green Entrepreneur registration", role: "entrepreneur" }
];

const INITIAL_FORMS = {
  mentor: {
    firstName: "",
    lastName: "",
    country: "",
    sex: "female",
    phone: "",
    address: "",
    expertise: "",
    previousExperience: "no",
    email: "",
    username: "",
    password: "",
    repeatPassword: ""
  },
  bso: {
    organizationName: "",
    country: "",
    address: "",
    legalStatus: "Public Institution",
    contactFirstName: "",
    contactLastName: "",
    phone: "",
    mainActivities: "",
    hasPrograms: "",
    username: "",
    email: "",
    password: "",
    repeatPassword: ""
  },
  entrepreneur: {
    firstName: "",
    lastName: "",
    country: "",
    sex: "",
    phone: "",
    dob: "",
    businessStage: "",
    sector: "",
    projectName: "",
    projectDescription: "",
    username: "",
    email: "",
    password: "",
    repeatPassword: ""
  }
};

export default function JoinUsPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTrack, setActiveTrack] = useState("mentor");
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTrack = useMemo(
    () => TRACKS.find((track) => track.key === activeTrack) || TRACKS[0],
    [activeTrack]
  );

  useEffect(() => {
    const track = searchParams.get("track");
    if (track && TRACKS.some((item) => item.key === track)) {
      setActiveTrack(track);
    }
  }, [searchParams]);

  function updateField(field, value) {
    setForms((prev) => ({
      ...prev,
      [activeTrack]: {
        ...prev[activeTrack],
        [field]: value
      }
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const currentForm = forms[activeTrack];

    if (currentForm.password !== currentForm.repeatPassword) {
      setError("Password and repeat password must match.");
      return;
    }

    const name =
      activeTrack === "bso"
        ? currentForm.organizationName
        : `${currentForm.firstName} ${currentForm.lastName}`.trim();

    setLoading(true);
    try {
      await register({
        name,
        email: currentForm.email,
        password: currentForm.password,
        role: selectedTrack.role
      });
      navigate("/app/tools");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const form = forms[activeTrack];

  return (
    <div className="auth-page join-page">
      <div className="join-shell card">
        <section className="join-header">
          <p className="auth-kicker">Join us</p>
          <h1>Choose your registration path</h1>
          <p>Complete your profile to apply and continue in the Toolbox.</p>
        </section>

        <div className="join-track-grid">
          {TRACKS.map((track) => (
            <button
              key={track.key}
              type="button"
              className={`join-track-btn ${activeTrack === track.key ? "active" : ""}`}
              onClick={() => setActiveTrack(track.key)}
            >
              {track.title}
            </button>
          ))}
        </div>

        <form className="form-stack join-form" onSubmit={onSubmit}>
          {activeTrack === "mentor" ? (
            <>
              <h2>Trainer registration</h2>
              <h3>Required Data</h3>
              <div className="grid-2">
                <input placeholder="First Name" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
                <input placeholder="Last Name" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
              </div>
              <input placeholder="Country of residence" value={form.country} onChange={(e) => updateField("country", e.target.value)} required />
              <select value={form.sex} onChange={(e) => updateField("sex", e.target.value)} required>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <input
                placeholder="Phone (216000000000)"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              <input placeholder="Address" value={form.address} onChange={(e) => updateField("address", e.target.value)} required />
              <h3>Business Data</h3>
              <input placeholder="Select your Area of Expertise" value={form.expertise} onChange={(e) => updateField("expertise", e.target.value)} required />
              <label className="small-label">
                Previous experience in supporting green and circular entrepreneurs and companies (Y/N)
              </label>
              <select value={form.previousExperience} onChange={(e) => updateField("previousExperience", e.target.value)} required>
                <option value="yes">Y</option>
                <option value="no">N</option>
              </select>
              <h3>User Data</h3>
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              <input placeholder="Username" value={form.username} onChange={(e) => updateField("username", e.target.value)} required />
              <input placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
              <input
                placeholder="Repeat password"
                type="password"
                value={form.repeatPassword}
                onChange={(e) => updateField("repeatPassword", e.target.value)}
                required
              />
            </>
          ) : null}

          {activeTrack === "bso" ? (
            <>
              <h2>Business support organization registration</h2>
              <h3>Required Data</h3>
              <input placeholder="Name of the organization" value={form.organizationName} onChange={(e) => updateField("organizationName", e.target.value)} required />
              <input placeholder="Country" value={form.country} onChange={(e) => updateField("country", e.target.value)} required />
              <input placeholder="Address" value={form.address} onChange={(e) => updateField("address", e.target.value)} required />
              <input placeholder="Legal Status" value={form.legalStatus} onChange={(e) => updateField("legalStatus", e.target.value)} required />
              <h3>Contact Person</h3>
              <div className="grid-2">
                <input placeholder="First Name" value={form.contactFirstName} onChange={(e) => updateField("contactFirstName", e.target.value)} required />
                <input placeholder="Last Name" value={form.contactLastName} onChange={(e) => updateField("contactLastName", e.target.value)} required />
              </div>
              <input
                placeholder="Phone (216000000000)"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              <textarea
                placeholder="Main activities in support of entrepreneurs"
                value={form.mainActivities}
                onChange={(e) => updateField("mainActivities", e.target.value)}
                required
              />
              <textarea
                placeholder="Specific programmes/activities for sustainable entrepreneurship"
                value={form.hasPrograms}
                onChange={(e) => updateField("hasPrograms", e.target.value)}
                required
              />
              <h3>User Data</h3>
              <input placeholder="Username" value={form.username} onChange={(e) => updateField("username", e.target.value)} required />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              <input placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
              <input
                placeholder="Repeat password"
                type="password"
                value={form.repeatPassword}
                onChange={(e) => updateField("repeatPassword", e.target.value)}
                required
              />
            </>
          ) : null}

          {activeTrack === "entrepreneur" ? (
            <>
              <h2>Green Entrepreneur registration</h2>
              <h3>Required Data</h3>
              <div className="grid-2">
                <input placeholder="First Name" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
                <input placeholder="Last Name" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
              </div>
              <input placeholder="Country of residence" value={form.country} onChange={(e) => updateField("country", e.target.value)} required />
              <select value={form.sex} onChange={(e) => updateField("sex", e.target.value)} required>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <input
                placeholder="Phone (216000000000)"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              <input type="date" value={form.dob} onChange={(e) => updateField("dob", e.target.value)} required />
              <h3>Business data</h3>
              <input placeholder="Select your business stage" value={form.businessStage} onChange={(e) => updateField("businessStage", e.target.value)} required />
              <input placeholder="Select your sector of activity" value={form.sector} onChange={(e) => updateField("sector", e.target.value)} required />
              <input placeholder="Project name" value={form.projectName} onChange={(e) => updateField("projectName", e.target.value)} required />
              <textarea
                placeholder="Project description"
                value={form.projectDescription}
                onChange={(e) => updateField("projectDescription", e.target.value)}
                required
              />
              <h3>User Data</h3>
              <input placeholder="Username" value={form.username} onChange={(e) => updateField("username", e.target.value)} required />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              <input placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
              <input
                placeholder="Repeat password"
                type="password"
                value={form.repeatPassword}
                onChange={(e) => updateField("repeatPassword", e.target.value)}
                required
              />
            </>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" disabled={loading}>
            {loading ? "Submitting..." : "Apply to Toolbox"}
          </button>
        </form>
      </div>
    </div>
  );
}
