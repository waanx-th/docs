import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

const primaryCards = [
  {
    title: <Translate id="homepage.card.unified.title">Unified V5 APIs</Translate>,
    description: (
      <Translate id="homepage.card.unified.desc">
        Build on WaanX&apos;s core REST and WebSocket APIs for spot trading with one consistent integration surface.
      </Translate>
    ),
    link: '/v5/guide',
    linkLabel: <Translate id="homepage.card.unified.link">Read the guide</Translate>,
    internal: true,
    tags: [
      <Translate id="homepage.card.unified.tag.1">REST + WebSocket</Translate>,
      <Translate id="homepage.card.unified.tag.2">Spot Trading</Translate>,
    ],
  },
];

const secondaryCards = [
  {
    title: <Translate id="homepage.card.mechanics.title">Learn Exchange Mechanics</Translate>,
    description: (
      <Translate id="homepage.card.mechanics.desc">
        Learn about spot orders and market data while the WaanX API scope is being confirmed.
      </Translate>
    ),
    link: 'https://support.waanx.com/en/support/home',
    linkLabel: <Translate id="homepage.card.mechanics.link">Help Center</Translate>,
    external: true,
  },
];

function Card({ title, eyebrow, description, link, linkLabel, external, internal, tags = [], links = [], secondary = false }) {
  const linkProps = internal
    ? { to: link }
    : { href: link, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) };
  const LinkComponent = internal ? Link : 'a';

  return (
    <article className={clsx(styles.card, secondary && styles.secondaryCard)}>
      <div className={styles.cardAccent} aria-hidden="true" />
      <div className={styles.cardInner}>
        {eyebrow && <div className={styles.cardEyebrow}>{eyebrow}</div>}
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.tagRow}>
            {tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {links.length > 0 && (
          <div className={styles.linkCluster}>
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.miniLink}>
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className={styles.cardFooter}>
        <LinkComponent {...linkProps} className={styles.cardLink}>
          <span>{linkLabel}</span>
          <span className={styles.cardLinkArrow} aria-hidden="true">
            →
          </span>
        </LinkComponent>
      </div>
    </article>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionIntro}>
          <div className={styles.sectionEyebrow}>
            <Translate id="homepage.section.eyebrow">Developer Toolkit</Translate>
          </div>
          <h2 className={styles.sectionTitle}>
            <Translate id="homepage.section.title">Build faster with WaanX APIs</Translate>
          </h2>
          <p className={styles.sectionDescription}>
            <Translate id="homepage.section.desc">
              Start with the official V5 API and integrate spot trading over REST and WebSocket.
            </Translate>
          </p>
        </div>

        <div className={styles.primaryGrid}>
          {primaryCards.map((card) => (
            <Card key={card.link} {...card} />
          ))}
        </div>

        <div className={styles.secondaryGrid}>
          {secondaryCards.map((card) => (
            <Card key={card.link} {...card} secondary />
          ))}
        </div>
      </div>
    </section>
  );
}
