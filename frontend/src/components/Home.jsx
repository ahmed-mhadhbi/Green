import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleLabel } from "../utils/roleLabels";

const HUB_NAV_ITEMS = [
  { key: "tools", title: { en: "Tools", fr: "Outils" }, getTo: ({ toolsHref }) => toolsHref },
  { key: "products", title: { en: "Products", fr: "Produits" }, getTo: ({ productsHref }) => productsHref },
  { key: "fund", title: { en: "Fund", fr: "Financement" }, getTo: () => "/hub/fund" },
  { key: "community", title: { en: "Community", fr: "Communauté" }, getTo: () => "/hub/community" },
  { key: "policy", title: { en: "Policy Hub", fr: "Hub des politiques" }, getTo: () => "/hub/policy" },
  { key: "ecosystems", title: { en: "Ecosystems", fr: "Écosystèmes" }, getTo: () => "/hub/ecosystems" },
  { key: "open-eco-innovation", title: { en: "Open Eco-innovation", fr: "Éco-innovation ouverte" }, getTo: () => "/hub/open-eco-innovation" },
];

const getInitialLanguage = () => {
  try {
    return window.localStorage.getItem("greenImpactLanguage") === "fr" ? "fr" : "en";
  } catch {
    return "en";
  }
};

export default function Home() {
  const statsRef = useRef(null);
  const hubRef = useRef(null);
  const { firebaseUser, profile, logout } = useAuth();
  const [showHubToolsPopup, setShowHubToolsPopup] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage);
  const text = (english, french) => language === "fr" ? french : english;
  const dashboardLabel = getRoleLabel(profile?.role, "Dashboard");

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem("greenImpactLanguage", language);
    } catch {
      // Keep the language switch functional when storage is unavailable.
    }
  }, [language]);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animated");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animateCounter = (element, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start);
        }
      }, 16);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll(".stat-number");
            numbers.forEach((num) => {
              const text = num.textContent;
              const value = parseInt(text.replace(/[^\d]/g, ""), 10);
              if (text.includes("%")) {
                const temp = document.createElement("span");
                temp.textContent = "0";
                num.textContent = "";
                num.appendChild(temp);
                animateCounter(temp, value);
                setTimeout(() => {
                  temp.textContent = `${value}%`;
                }, 2100);
              } else {
                animateCounter(num, value);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!hubRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHubToolsPopup(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: "-8% 0px -38% 0px" }
    );

    observer.observe(hubRef.current);
    return () => observer.disconnect();
  }, []);

  const dashboardHref = firebaseUser ? "/dashboard" : "/login";
  const toolsHref = firebaseUser ? "/app/tools" : "/join-us";
  const productsHref = firebaseUser ? "/app/products" : "/join-us";

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo" aria-label="Green Impact home">
            <img src="/images/y.jpg" alt="Green Impact" className="brand-logo-image" />
          </a>
          <div className="home-nav-actions">
            <ul className="nav-links">
              <li><a href="#home">{text("Home", "Accueil")}</a></li>
              {!firebaseUser ? <li><a href="#join-us">{text("Join Us", "Nous rejoindre")}</a></li> : null}
              <li><a href="#hub">{text("Platform Hub", "Hub de la plateforme")}</a></li>
              <li><a href="#about">{text("About", "À propos")}</a></li>
              <li><a href="#achievements">{text("Achievements", "Réalisations")}</a></li>
              <li><a href="#contact">Contact</a></li>
              {!firebaseUser ? (
                <li><a href="#join-us" className="login-btn">{text("Login", "Connexion")}</a></li>
              ) : (
                <>
                  <li><Link to={dashboardHref} className="login-btn">{language === "fr" ? "Tableau de bord" : dashboardLabel}</Link></li>
                  <li><button className="home-signout-btn" onClick={logout}>{text("Sign out", "Déconnexion")}</button></li>
                </>
              )}
            </ul>
            <button
              type="button"
              className="language-switch"
              onClick={() => setLanguage((current) => current === "fr" ? "en" : "fr")}
              aria-label={text("Switch to French", "Passer en anglais")}
              title={text("Switch to French", "Passer en anglais")}
            >
              <span className={language === "fr" ? "active" : ""}>FR</span>
              <span aria-hidden="true">/</span>
              <span className={language === "en" ? "active" : ""}>EN</span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`hub-tools-popup ${showHubToolsPopup ? "visible" : ""}`} aria-hidden={!showHubToolsPopup}>
        <div className="hub-tools-popup-head">
          <span>{text("Tools navigator", "Navigateur d’outils")}</span>
          <a href="#hub">{text("Platform Hub", "Hub de la plateforme")}</a>
        </div>
        <div className="hub-tools-popup-list">
          {HUB_NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className="hub-tool-pill"
              to={item.getTo({ toolsHref, productsHref })}
            >
              {item.title[language]}
            </Link>
          ))}
        </div>
      </div>

      <section className="institutional-support" id="home" aria-labelledby="institutional-support-title">
        <div className="institutional-support-inner animate-on-scroll">
          <div className="institutional-support-heading">
            <span>{text("Supported by", "Avec le soutien de")}</span>
            <h2 id="institutional-support-title">{text("Greenov'i and its institutional partners", "Greenov'i et ses partenaires institutionnels")}</h2>
          </div>
          <div className="institutional-logo-bar" aria-label="Partenaires du projet Greenov'i">
            <a href="https://greenovi.tn" target="_blank" rel="noreferrer" aria-label="Visiter le site de Greenov'i">
              <img src="/images/a.png" alt="Greenov'i" />
            </a>
            <a href="https://www.eeas.europa.eu/delegations/tunisia_fr?s=126" target="_blank" rel="noreferrer" aria-label="Visiter le site de l'Union européenne en Tunisie">
              <img src="/images/b.png" alt="Financé par l'Union européenne" />
            </a>
            <div className="institutional-logo-item">
              <img src="/images/c.jpg" alt="Tunisie Verte et Durable" />
            </div>
            <div className="institutional-logo-item institutional-logo-item-wide">
              <img src="/images/d.jpg" alt="France et Expertise France, Groupe AFD" />
            </div>
            <div className="institutional-logo-item">
              <img src="/images/e.png" alt="République Tunisienne" />
            </div>
          </div>
        </div>
      </section>

      <section className="hero">
        <video
          className="hero-video"
          src="/videos/bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-overlay" />
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="hero-content">
          <h1>Green Impact</h1>
          <p className="subtitle">{text("The home of sustainable business", "La maison de l’entrepreneuriat durable")}</p>
          <a href="#hub" className="cta-button">{text("Explore platform", "Explorer la plateforme")}</a>
        </div>
      </section>

      <section className="institutional-statement" aria-label={text("Green Impact institutional support", "Soutien institutionnel de Green Impact")}>
        <p className="institutional-boilerplate">
          {text(
            "The Green Impact project is supported by Greenov'i, a project funded by the European Union in Tunisia through the green entrepreneurship component of its Green & Sustainable Tunisia programme supporting environmental action in Tunisia, and implemented by Expertise France in collaboration with CITET Tunisia, the Ministry of the Environment and the Ministry of Economy and Planning.",
            "Le projet Green Impact est soutenu par Greenov'i, un projet financé par l’Union Européenne en Tunisie à travers le volet entrepreneuriat vert de son Programme «Tunisie Verte & Durable » pour l’appui à l’action environnementale en Tunisie et mis en œuvre par Expertise France en collaboration avec le CITET Tunisia, le Ministère de l’Environnement et le Ministère de l’Economie et de la Planification."
          )}
        </p>

        <article className="application-callout animate-on-scroll" aria-labelledby="application-callout-title">
          <div className="application-callout-visual">
            <img
              src="/images/green-impact-call-for-applications-2026.jpeg"
              alt={text("Green Impact call for applications flyer", "Affiche de l'appel à candidatures Green Impact")}
            />
          </div>
          <div className="application-callout-content">
            <span className="application-callout-kicker">{text("Applications open", "Candidatures ouvertes")}</span>
            <h2 id="application-callout-title">{text("Green Impact Call for Applications", "Appel à candidatures Green Impact")}</h2>
            <p className="application-callout-share">
              <span aria-hidden="true">📢</span>{" "}
              {text(
                "Don’t miss this opportunity! Share this call with your network!",
                "Ne manquez pas cette opportunité\u00a0! Partagez cet appel autour de vous."
              )}
            </p>
            <div className="application-callout-links">
              <a
                href="https://docs.google.com/.../1FAIpQLSdU1a9d9MNd5o.../viewform"
                target="_blank"
                rel="noreferrer"
              >
                <span className="application-callout-link-label">
                  <span aria-hidden="true">👉</span>{" "}
                  {text("Application form", "Formulaire de candidature")}
                </span>
                <span className="application-callout-link-url">docs.google.com/.../viewform</span>
              </a>
              <a
                href="https://drive.google.com/file/d/10Z8dqUEV4CYAsNWPGdNytIWxmrr5GDgM/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
              >
                <span className="application-callout-link-label">
                  <span aria-hidden="true">📄</span>{" "}
                  {text("Read the Call for Applications", "Consultez l'appel à candidatures")}
                </span>
                <span className="application-callout-link-url">drive.google.com/file/d/10Z8.../view</span>
              </a>
            </div>
          </div>
        </article>
      </section>

      {!firebaseUser ? (
        <section className="join-section" id="join-us">
          <div className="section-header animate-on-scroll">
            <h2>{text("Join Us", "Nous rejoindre")}</h2>
            <p>{text("Choose your profile, fill the form, and apply in Tools.", "Choisissez votre profil, remplissez le formulaire et déposez votre candidature dans les Outils.")}</p>
          </div>
          <div className="join-choice-grid animate-on-scroll">
            <Link to="/join-us?track=entrepreneur" className="join-choice">
              <img src="/images/Green%20Entrepreneur.webp" alt={text("Green entrepreneur registration", "Inscription entrepreneur vert")} className="join-choice-image" />
              <h3>{text("Green Entrepreneur registration", "Inscription entrepreneur vert")}</h3>
              <p>{text("For entrepreneurs building sustainable and circular projects.", "Pour les entrepreneurs qui développent des projets durables et circulaires.")}</p>
            </Link>
            <Link to="/join-us?track=bso" className="join-choice">
              <img src="/images/buisness%20support.png" alt={text("Business support organization registration", "Inscription structure d’accompagnement")} className="join-choice-image" />
              <h3>{text("Business support organization registration", "Inscription structure d’accompagnement")}</h3>
              <p>{text("For institutions and organizations with sustainable programs.", "Pour les institutions et organisations qui portent des programmes durables.")}</p>
            </Link>
            <Link to="/join-us?track=mentor" className="join-choice">
              <img src="/images/mentor.png" alt={text("Mentor registration", "Inscription mentor")} className="join-choice-image" />
              <h3>{text("Trainer registration", "Inscription formateur")}</h3>
              <p>{text("For mentors and trainers supporting green businesses.", "Pour les mentors et formateurs qui accompagnent les entreprises vertes.")}</p>
            </Link>

          </div>
          <div className="join-actions">
            <Link to="/join-us" className="btn primary">{text("Open Join Us forms", "Ouvrir les formulaires d’inscription")}</Link>
            <Link to="/login" className="btn">{text("Already registered? Sign in", "Déjà inscrit ? Se connecter")}</Link>
          </div>
        </section>
      ) : null}

      <section className="pathfinder" id="hub" ref={hubRef}>
        <div className="section-header hub-section-header animate-on-scroll">
          <h2>{text("Platform Hub", "Hub de la plateforme")}</h2>
          <p>{text("Choose the support area that matches your next step. Every card opens a dedicated space with practical information and clear actions.", "Choisissez l’espace d’accompagnement adapté à votre prochaine étape. Chaque carte ouvre un espace dédié avec des informations pratiques et des actions claires.")}</p>
        </div>
        <div className="cards-grid hub-cards">
          <Link to={toolsHref} className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Core workspace", "Espace principal")}</span>
            <div className="card-icon">
              <img src="/images/toolbox.png" alt={text("Tools", "Outils")} className="card-icon-image" />
            </div>
            <h3>{text("Tools", "Outils")}</h3>
            <p>{text("Open the guided sustainable business tools and questionnaires.", "Accédez aux outils guidés et aux questionnaires pour l’entrepreneuriat durable.")}</p>
          </Link>
          <Link to={productsHref} className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Operations", "Opérations")}</span>
            <div className="card-icon">
              <img src="/images/product.avif" alt={text("Products", "Produits")} className="card-icon-image" />
            </div>
            <h3>{text("Products", "Produits")}</h3>
            <p>{text("Access forms, workshops, application calls, and generated documents.", "Accédez aux formulaires, ateliers, appels à candidatures et documents générés.")}</p>
          </Link>
          <Link to="/hub/fund" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Funding", "Financement")}</span>
            <div className="card-icon">
              <img src="/images/funds.png" alt={text("Fund", "Financement")} className="card-icon-image" />
            </div>
            <h3>{text("Fund", "Financement")}</h3>
            <p>{text("Prepare for funding and understand pathways connecting sustainable businesses with financial actors in Tunisia.", "Préparez votre financement et découvrez les parcours reliant les entreprises durables aux acteurs financiers en Tunisie.")}</p>
          </Link>
          <Link to="/hub/community" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Network", "Réseau")}</span>
            <div className="card-icon">
              <img src="/images/community.png" alt={text("Community", "Communauté")} className="card-icon-image" />
            </div>
            <h3>{text("Community", "Communauté")}</h3>
            <p>{text("Meet entrepreneurs, mentors and support organizations advancing sustainable businesses across Tunisia.", "Rencontrez les entrepreneurs, mentors et structures d’accompagnement qui font progresser l’entrepreneuriat durable en Tunisie.")}</p>
          </Link>
          <Link to="/hub/policy" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Insights", "Ressources")}</span>
            <div className="card-icon">
              <img src="/images/policy.png" alt={text("Policy Hub", "Hub des politiques")} className="card-icon-image" />
            </div>
            <h3>{text("Policy Hub", "Hub des politiques")}</h3>
            <p>{text("Explore resources and dialogue around enabling policies for sustainable businesses in Tunisia.", "Explorez les ressources et les échanges sur les politiques favorables aux entreprises durables en Tunisie.")}</p>
          </Link>
          <Link to="/hub/ecosystems" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">{text("Ecosystem", "Écosystème")}</span>
            <div className="card-icon">
              <img src="/images/ecosystems.png" alt={text("Ecosystems", "Écosystèmes")} className="card-icon-image" />
            </div>
            <h3>{text("Ecosystems", "Écosystèmes")}</h3>
            <p>{text("Understand and strengthen the partnerships that support green and circular business development in Tunisia.", "Comprenez et renforcez les partenariats qui soutiennent le développement des entreprises vertes et circulaires en Tunisie.")}</p>
          </Link>
          <Link to="/hub/open-eco-innovation" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Innovation</span>
            <div className="card-icon">
              <img src="/images/open.png" alt={text("Open Eco-innovation", "Éco-innovation ouverte")} className="card-icon-image" />
            </div>
            <h3>{text("Open Eco-innovation", "Éco-innovation ouverte")}</h3>
            <p>{text("Connect companies and institutions seeking green solutions with entrepreneurs ready to innovate.", "Mettez en relation les entreprises et institutions à la recherche de solutions vertes avec des entrepreneurs prêts à innover.")}</p>
          </Link>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-content">
          <div className="about-text animate-on-scroll">
            <h2>{text("About", "À propos")}</h2>
            <p>
              <strong>GreenImpact</strong> {text(
                "belongs to the Green Impact Support Programme, an initiative contributing to the 2030 Agenda for Sustainable Development and its SDGs by creating and strengthening sustainable businesses.",
                "fait partie du Programme d’appui Green Impact, une initiative qui contribue à l’Agenda 2030 pour le développement durable et à ses ODD en créant et en renforçant des entreprises durables."
              )}
            </p>
            <p>
              {text(
                "To create an enabling ecosystem for sustainable enterprises, the Green Impact Support Programme works closely with green and circular entrepreneurs and companies, business support organizations, trainers and mentors, financial institutions, policymakers and other relevant stakeholders.",
                "Afin de créer un écosystème favorable aux entreprises durables, le Programme d’appui Green Impact travaille étroitement avec les entrepreneurs et entreprises vertes et circulaires, les structures d’accompagnement, les formateurs et mentors, les institutions financières, les décideurs publics et les autres parties prenantes."
              )}
            </p>
            <p>
              {text(
                "In Tunisia, we develop partnerships and a shared community of practice among business support organizations serving sustainable entrepreneurs and companies.",
                "En Tunisie, nous développons des partenariats et une communauté de pratiques commune entre les structures d’accompagnement au service des entrepreneurs et entreprises durables."
              )}
            </p>
            <p>
              {text(
                "Our main beneficiaries are the Green Impact community and businesses implementing innovative environmental and social solutions that support the transition to sustainable and fair consumption and production models.",
                "Nos principaux bénéficiaires sont la communauté Green Impact et les entreprises qui mettent en œuvre des solutions environnementales et sociales innovantes contribuant à la transition vers des modes de consommation et de production durables et équitables."
              )}
            </p>
          </div>

          <div className="about-visual animate-on-scroll">
            <div className="visual-photo visual-photo-1">
              <img src="/images/about-visual1.jpg" alt="Reduce Reuse Recycle" />
            </div>
            <div className="visual-photo visual-photo-2">
              <img src="/images/about-visual2.jpg" alt="Green energy and plant growth" />
            </div>
            <div className="visual-photo visual-photo-3">
              <img src="/images/about-visual3.png" alt="Sustainable forest ecosystem" />
            </div>
          </div>
        </div>

        <div className="about-gallery animate-on-scroll">
          <div>
            <h4>{text("We support you at every stage of development:", "Nous vous accompagnons à chaque étape de votre développement :")}</h4><br /><br />
            <img
              src="/images/about1.png"
              alt="Sustainable business development"
              className="about-gallery-image"
            />
          </div>
          <div>
            <h4>{text("We provide the Green Impact community with a comprehensive set of services to design,", "Nous proposons à la communauté Green Impact un ensemble complet de services pour concevoir,")}</h4> <h4>{text("develop and accelerate their green and circular businesses:", "développer et accélérer leurs entreprises vertes et circulaires :")}</h4><br />
            <img
              src="/images/about2.png"
              alt="Green entrepreneurship"
              className="about-gallery-image"
            />
          </div>
        </div>
      </section>

      <section id="achievements">
        <div className="achievements-header animate-on-scroll">
          <h2>{text("Achievements", "Réalisations")}</h2>
        </div>

        <section className="stats" ref={statsRef}>
          <div className="stats-grid">
            {[
              { number: 630, label: text("Entrepreneurs", "Entrepreneurs"), desc: text("People supported in developing their sustainable businesses.", "Personnes accompagnées dans le développement de leurs entreprises durables.") },
              { number: 12, label: text("Trainers", "Formateurs"), desc: text("Experts trained in sustainable business model development.", "Experts formés au développement de modèles d’affaires durables.") },
              { number: 3, label: text("BSO", "SAE"), desc: text("Business support organizations in the Green Impact Support Programme.", "Structures d’accompagnement membres du Programme d’appui Green Impact.") },
              { number: 654, label: text("Members", "Membres"), desc: text("Eco-innovators in the Green Impact community.", "Éco-innovateurs de la communauté Green Impact.") },
              { number: "64%", label: text("are women", "sont des femmes"), desc: text("Share of supported entrepreneurs who are women.", "Part des entrepreneurs accompagnés qui sont des femmes.") },
              { number: "70%", label: text("are satisfied", "sont satisfaits"), desc: text("Share of entrepreneurs satisfied with the support services and tools.", "Part des entrepreneurs satisfaits des services et outils d’accompagnement.") }
            ].map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <div className="stat-label">{stat.label}</div>
                <p className="stat-description">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="contact" id="contact">
        <div className="contact-container">
          <div className="contact-info animate-on-scroll">
            <h2>{text("Contact us", "Contactez-nous")}</h2>
            <div className="contact-item">
              <h3>{text("Phone", "Téléphone")}</h3>
              <p>51266459</p>
            </div>
            <div className="contact-item">
              <h3>{text("Location", "Localisation")}</h3>
              <p>Regueb , Sidi Bouzid , Tunis</p>
            </div>
            <div className="contact-item">
              <h3>{text("Email", "E-mail")}</h3>
              <p>
                <a href="mailto:association.rawafed1@gmail.com">association.rawafed1@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/images/y.jpg" alt="Green Impact" className="footer-brand-logo" />
          </div>
          <div className="footer-section">
            <h3>{text("Quick links", "Liens rapides")}</h3>
            <ul className="footer-links">
              <li><a href="#home">{text("Home", "Accueil")}</a></li>
              <li><a href="#hub">{text("Platform Hub", "Hub de la plateforme")}</a></li>
              <li><a href="#about">{text("About", "À propos")}</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="https://greenovi.tn" target="_blank" rel="noreferrer">Greenov&apos;i</a></li>
              <li><a href="https://www.eeas.europa.eu/delegations/tunisia_fr?s=126" target="_blank" rel="noreferrer">{text("European Union in Tunisia", "Union européenne en Tunisie")}</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#hub">{text("Tools", "Outils")}</a></li>
              <li><a href="#hub">{text("Products", "Produits")}</a></li>
              <li><a href="#hub">{text("Community", "Communauté")}</a></li>
              <li><a href="#hub">{text("Policy Hub", "Hub des politiques")}</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>{text("Follow us", "Suivez-nous")}</h3>
            <ul className="footer-links">
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-lower">
            <div className="footer-lower-left">
              <div className="footer-credits">
                <p>{text("Developed by:", "Développé par :")}</p>
                <div className="footer-credit-images">
                  <img src="/images/x.png" alt="Developed by rawafed" className="footer-credit-image" />
                  <img src="/images/y.jpg" alt="Developed by Green impact" className="footer-credit-image" />
                </div>
              </div>
              <p>{text("Funded by:", "Financé par :")}</p>
              <div className="footer-partners">
                <img src="/images/a.png" alt="Partner a" className="footer-partner-image" />
                <img src="/images/b.png" alt="Partner b" className="footer-partner-image" />
                <img src="/images/c.jpg" alt="Partner c" className="footer-partner-image" />
                <img src="/images/d.jpg" alt="Partner d" className="footer-partner-image" />
                <img src="/images/e.png" alt="Partner e" className="footer-partner-image" />
              </div>
            </div>
          </div>
          <p>&copy; 2026 GreenImpact</p>
        </div>
      </footer>
    </div>
  );
}




