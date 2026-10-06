import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className="container">
        <div className={styles.heroBadge}>V5 API</div>
        <h1 className={styles.heroTitle}>
          <Translate id="homepage.hero.title">WaanX API Documentation</Translate>
        </h1>
        <p className={styles.heroSubtitle}>
          <Translate id="homepage.hero.subtitle">
            Build trading applications with WaanX's unified V5 API.
            Access REST and WebSocket APIs through a single integration.
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link
            className={clsx('button button--lg', styles.primaryButton)}
            to="/v5/intro">
            <Translate id="homepage.hero.cta.primary">Get Started</Translate>
          </Link>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}>
            <Translate id="homepage.hero.meta.1">REST + WebSocket</Translate>
          </span>
          <span className={styles.heroMetaDot} />
          <span className={styles.heroMetaItem}>
            <Translate id="homepage.hero.meta.3">Real-time Data</Translate>
          </span>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="WaanX API Documentation"
      description="Build trading applications with WaanX's unified V5 Open API over REST and WebSocket.">
      <main>
        <HomepageFeatures />
        <HomepageHeader />
      </main>
    </Layout>
  );
}
