'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';

interface Editor {
  name: string;
  role: string;
  affiliation: string;
  expertise: string[];
  email: string;
  image?: string;
}

const CHIEF_EDITORS: Editor[] = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Editor-in-Chief",
    affiliation: "Stanford University, USA",
    expertise: ["Computer Science", "Artificial Intelligence", "Machine Learning"],
    email: "s.mitchell@universalpublishers.com"
  },
  {
    name: "Prof. James Anderson",
    role: "Deputy Editor-in-Chief",
    affiliation: "University of Oxford, UK",
    expertise: ["Mathematics", "Statistics", "Data Science"],
    email: "j.anderson@universalpublishers.com"
  }
];

const ASSOCIATE_EDITORS: Editor[] = [
  {
    name: "Dr. Maria Garcia",
    role: "Associate Editor",
    affiliation: "MIT, USA",
    expertise: ["Biomedical Engineering", "Healthcare Technology"],
    email: "m.garcia@universalpublishers.com"
  },
  {
    name: "Prof. Chen Wei",
    role: "Associate Editor",
    affiliation: "Tsinghua University, China",
    expertise: ["Physics", "Quantum Computing"],
    email: "c.wei@universalpublishers.com"
  },
  {
    name: "Dr. Ahmed Hassan",
    role: "Associate Editor",
    affiliation: "Cairo University, Egypt",
    expertise: ["Environmental Science", "Sustainability"],
    email: "a.hassan@universalpublishers.com"
  },
  {
    name: "Prof. Emma Thompson",
    role: "Associate Editor",
    affiliation: "University of Cambridge, UK",
    expertise: ["Chemistry", "Materials Science"],
    email: "e.thompson@universalpublishers.com"
  }
];

const EDITORIAL_BOARD: Editor[] = [
  {
    name: "Dr. Raj Kumar",
    role: "Editorial Board Member",
    affiliation: "IIT Delhi, India",
    expertise: ["Software Engineering", "Cloud Computing"],
    email: "r.kumar@universalpublishers.com"
  },
  {
    name: "Prof. Lisa Wagner",
    role: "Editorial Board Member",
    affiliation: "ETH Zurich, Switzerland",
    expertise: ["Robotics", "Automation"],
    email: "l.wagner@universalpublishers.com"
  },
  {
    name: "Dr. Carlos Rodriguez",
    role: "Editorial Board Member",
    affiliation: "University of São Paulo, Brazil",
    expertise: ["Biotechnology", "Genetics"],
    email: "c.rodriguez@universalpublishers.com"
  },
  {
    name: "Prof. Yuki Tanaka",
    role: "Editorial Board Member",
    affiliation: "University of Tokyo, Japan",
    expertise: ["Electronics", "Nanotechnology"],
    email: "y.tanaka@universalpublishers.com"
  },
  {
    name: "Dr. Sophie Dubois",
    role: "Editorial Board Member",
    affiliation: "Sorbonne University, France",
    expertise: ["Neuroscience", "Cognitive Science"],
    email: "s.dubois@universalpublishers.com"
  },
  {
    name: "Prof. Michael O'Brien",
    role: "Editorial Board Member",
    affiliation: "University of Melbourne, Australia",
    expertise: ["Climate Science", "Oceanography"],
    email: "m.obrien@universalpublishers.com"
  }
];

export default function EditorialBoardPage() {
  const renderEditorCard = (editor: Editor) => (
    <Card key={editor.email} className="editor-card">
      <div className="editor-content">
        <div className="editor-avatar">
          <Avatar 
            icon="pi pi-user" 
            size="xlarge" 
            shape="circle"
            style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
          />
        </div>
        <div className="editor-info">
          <h3>{editor.name}</h3>
          <div className="editor-role">
            <i className="pi pi-briefcase"></i>
            <span>{editor.role}</span>
          </div>
          <div className="editor-affiliation">
            <i className="pi pi-building"></i>
            <span>{editor.affiliation}</span>
          </div>
          <div className="editor-email">
            <i className="pi pi-envelope"></i>
            <a href={`mailto:${editor.email}`}>{editor.email}</a>
          </div>
          <div className="editor-expertise">
            <i className="pi pi-tags"></i>
            <div className="expertise-tags">
              {editor.expertise.map((exp, idx) => (
                <span key={idx} className="expertise-tag">{exp}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <Header />
      <main className="editorial-board-page">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Editorial Board', href: '/editorial-board' }
          ]}
        />

        <div className="container">
          {/* Hero Section */}
          <section className="board-hero">
            <div className="hero-content">
              <h1>Editorial Board</h1>
              <p className="lead">
                Our distinguished editorial team comprises leading experts from prestigious 
                institutions worldwide, ensuring the highest standards of academic excellence.
              </p>
            </div>
          </section>

          {/* Introduction */}
          <section className="intro-section">
            <Card className="intro-card">
              <h2>About Our Editorial Board</h2>
              <p>
                The Editorial Board of Universal Publishers consists of internationally recognized 
                scholars and researchers who are leaders in their respective fields. Our editorial 
                team is committed to maintaining the highest standards of scientific rigor, ethical 
                publishing practices, and advancing knowledge across diverse disciplines.
              </p>
              <div className="responsibilities">
                <h3>Key Responsibilities</h3>
                <ul>
                  <li>
                    <i className="pi pi-check-circle"></i>
                    Overseeing the peer review process to ensure quality and integrity
                  </li>
                  <li>
                    <i className="pi pi-check-circle"></i>
                    Providing strategic guidance on journal development and scope
                  </li>
                  <li>
                    <i className="pi pi-check-circle"></i>
                    Contributing to special issues and editorial content
                  </li>
                  <li>
                    <i className="pi pi-check-circle"></i>
                    Promoting the journal within their research communities
                  </li>
                  <li>
                    <i className="pi pi-check-circle"></i>
                    Ensuring adherence to ethical publishing standards
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Editorial Team */}
          <section className="team-section">
            <TabView>
              <TabPanel header="Editor-in-Chief" leftIcon="pi pi-star">
                <div className="editors-grid">
                  {CHIEF_EDITORS.map(editor => renderEditorCard(editor))}
                </div>
              </TabPanel>

              <TabPanel header="Associate Editors" leftIcon="pi pi-users">
                <div className="editors-grid">
                  {ASSOCIATE_EDITORS.map(editor => renderEditorCard(editor))}
                </div>
              </TabPanel>

              <TabPanel header="Editorial Board" leftIcon="pi pi-sitemap">
                <div className="editors-grid">
                  {EDITORIAL_BOARD.map(editor => renderEditorCard(editor))}
                </div>
              </TabPanel>
            </TabView>
          </section>

          {/* Join Section */}
          <section className="join-section">
            <Card className="join-card">
              <div className="join-icon">
                <i className="pi pi-user-plus"></i>
              </div>
              <h2>Join Our Editorial Team</h2>
              <p>
                We are always looking for distinguished researchers and academics to join our 
                editorial board. If you are interested in contributing to our mission of advancing 
                scholarly research, we would love to hear from you.
              </p>
              <a href="/contact" className="btn-primary">
                <i className="pi pi-envelope"></i>
                Express Your Interest
              </a>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
