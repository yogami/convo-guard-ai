/**
 * Landing Page - ConvoGuard AI
 * Hero section with API demo and call-to-action
 */
import styles from './page.module.css';
import Link from 'next/link';
import { ChatSimulator } from './dashboard/components/ChatSimulator';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span>🛡️</span> ConvoGuard AI
        </div>
        <div className={styles.navLinks}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/api/health" className={styles.navLink}>API Status</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Mental Health AI<br />
          <span className={styles.gradient}>Compliance in 1 API Call</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Real-time validator for EU AI Act, DiGA, and GDPR compliance.
          Protect your mental health chatbot users.
        </p>
        <div className={styles.heroButtons}>
          <Link href="/dashboard" className={styles.primaryBtn}>
            View Dashboard →
          </Link>
          <a href="#demo" className={styles.secondaryBtn}>
            Try Demo
          </a>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className={styles.demoSection}>
        <h2 className={styles.sectionTitle}>Try the Compliance Engine</h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem', color: '#64748b' }}>
          Experience real-time policy enforcement. The simulation below connects directly to our EU Regulatory Database.
        </p>
        <div style={{ padding: '0 1rem' }}>
          <ChatSimulator />
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Compliance Rules</h2>
        <div className={styles.featuresGrid}>
          <FeatureCard
            icon="🚨"
            title="Suicide Detection"
            description="HIGH-RISK: Detects suicidal ideation and self-harm triggers"
            weight="-50"
          />
          <FeatureCard
            icon="🎭"
            title="Manipulation Check"
            description="FLAGS exploitation, pressure tactics, and vulnerability abuse"
            weight="-30"
          />
          <FeatureCard
            icon="🆘"
            title="Crisis Escalation"
            description="Ensures AI provides emergency resources when needed"
            weight="-25"
          />
          <FeatureCard
            icon="📋"
            title="GDPR Consent"
            description="Verifies proper consent collection for data processing"
            weight="-15"
          />
          <FeatureCard
            icon="📊"
            title="DiGA Evidence"
            description="Checks for clinical evidence collection (mood tracking)"
            weight="-10"
          />
          <FeatureCard
            icon="🤖"
            title="AI Transparency"
            description="Ensures AI discloses its nature per EU AI Act"
            weight="-10"
          />
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to comply?</h2>
        <p className={styles.ctaSubtitle}>
          Berlin&apos;s 20+ mental health AI startups need this NOW.
        </p>
        <Link href="/dashboard" className={styles.primaryBtn}>
          Get Started →
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>🛡️ ConvoGuard AI — EU AI Act • DiGA • GDPR</p>
        <p>Built for CIC Berlin / Soonami Accelerator</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  weight: string;
}

function FeatureCard({ icon, title, description, weight }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.featureIcon}>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{description}</p>
      <span className={styles.featureWeight}>Weight: {weight}</span>
    </div>
  );
}
