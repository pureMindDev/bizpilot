import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiMenu, FiX, FiArrowRight, FiBox, FiShoppingCart, FiUsers,
  FiUserPlus, FiCreditCard, FiBarChart2, FiCheck, FiShield, FiLock,
} from 'react-icons/fi';
import { mockPlans } from '../../data/mockPlans';
import styles from './Landing.module.scss';

const TICKER_LINES = [
  { time: '14:32', tag: 'SALE', tone: 'sale', text: '#INV-2291', amount: '₦4,500' },
  { time: '14:33', tag: 'STOCK', tone: 'stock', text: 'Rice 50kg — 2 sold', amount: '14 left' },
  { time: '14:35', tag: 'SALE', tone: 'sale', text: '#INV-2292', amount: '₦12,300' },
  { time: '14:36', tag: 'ALERT', tone: 'alert', text: 'Sugar 1kg running low', amount: '3 left' },
  { time: '14:38', tag: 'SALE', tone: 'sale', text: '#INV-2293', amount: '₦2,100' },
  { time: '14:41', tag: 'STAFF', tone: 'neutral', text: 'Ngozi clocked in', amount: '' },
  { time: '14:44', tag: 'SALE', tone: 'sale', text: '#INV-2294', amount: '₦8,750' },
  { time: '14:47', tag: 'ALERT', tone: 'alert', text: 'Milo 400g running low', amount: '5 left' },
  { time: '14:50', tag: 'SALE', tone: 'sale', text: '#INV-2295', amount: '₦3,200' },
  { time: '14:53', tag: 'EXPENSE', tone: 'expense', text: 'Fuel for generator', amount: '−₦6,000' },
];

const FEATURES = [
  { icon: FiBox, title: 'Inventory', text: 'Every item, every quantity, updated the second it sells or runs low — not at month-end stocktake.' },
  { icon: FiShoppingCart, title: 'Sales & POS', text: 'Ring up sales, take part-payments, and watch stock and revenue update together, automatically.' },
  { icon: FiUsers, title: 'Customers', text: 'Know who buys what, how often, and who owes you — without digging through old receipts.' },
  { icon: FiUserPlus, title: 'Staff', text: 'Give each cashier or manager exactly the access they need, and see who did what, and when.' },
  { icon: FiCreditCard, title: 'Expenses', text: 'Log fuel, rent, and restock costs as they happen, so your real profit is never a guess.' },
  { icon: FiBarChart2, title: 'Reports', text: 'Daily, weekly, and monthly numbers that actually reflect your shop — ready before you lock up.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}><FiZap size={19} /> BizPilot</div>

          <nav className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.navLogin}>Log in</Link>
            <Link to="/register" className={styles.navCta}>Get started <FiArrowRight size={14} /></Link>
          </div>

          <button className={styles.navToggle} onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className={styles.navMobile}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className={styles.navCta}>Get started</Link>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroCopy}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.span className={styles.eyebrow} variants={fadeUp}>Built for Nigerian retail</motion.span>
            <motion.h1 variants={fadeUp}>
              Stop closing the shop and<br />wondering where the money went.
            </motion.h1>
            <motion.p className={styles.heroSub} variants={fadeUp}>
              BizPilot tracks every sale, every naira, and every item on your shelf as it happens —
              so your numbers are ready before you lock up, not after.
            </motion.p>
            <motion.div className={styles.heroActions} variants={fadeUp}>
              <Link to="/register" className={styles.ctaPrimary}>Start free — no card required <FiArrowRight size={16} /></Link>
              <Link to="/login" className={styles.ctaGhost}>Log in</Link>
            </motion.div>
            <motion.p className={styles.heroFinePrint} variants={fadeUp}>
              Naira-native · Role-based staff access · Secure payments via Paystack
            </motion.p>
          </motion.div>

          <motion.div
            className={styles.tickerCard}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.tickerHead}>
              <span className={styles.liveDot} /> Live activity
              <span className={styles.tickerShop}>Ogundipe Stores</span>
            </div>
            <div className={styles.tickerViewport}>
              <div className={styles.tickerTrack}>
                {[...TICKER_LINES, ...TICKER_LINES].map((line, i) => (
                  <div className={styles.tickerRow} key={i}>
                    <span className={styles.tTime}>{line.time}</span>
                    <span className={`${styles.tTag} ${styles[`t-${line.tone}`]}`}>{line.tag}</span>
                    <span className={styles.tText}>{line.text}</span>
                    <span className={styles.tAmount}>{line.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section className={styles.contrast}>
        <motion.div className={styles.sectionHead} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <h2>You already run a tight shop. Your records should keep up.</h2>
        </motion.div>
        <div className={styles.contrastGrid}>
          <motion.div className={styles.contrastCol} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <span className={styles.contrastLabel}>The notebook</span>
            <ul>
              <li>Stock counts you trust until you count again</li>
              <li>Today's profit is yesterday's guess, redone</li>
              <li>One missing page means one missing week</li>
              <li>Staff discounts nobody remembers approving</li>
            </ul>
          </motion.div>
          <motion.div
            className={`${styles.contrastCol} ${styles.contrastColActive}`}
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] } } }}
          >
            <span className={styles.contrastLabel}>BizPilot</span>
            <ul>
              <li>Stock updates the second an item sells</li>
              <li>Profit totals ready the moment you close</li>
              <li>Every sale timestamped, backed up, searchable</li>
              <li>Every discount tied to the staff who gave it</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={styles.features} id="features">
        <motion.div className={styles.sectionHead} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <span className={styles.eyebrowDark}>Everything in one place</span>
          <h2>One dashboard for how your shop actually runs.</h2>
        </motion.div>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <motion.div
              className={styles.featureCard}
              key={f.title}
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] } } }}
            >
              <span className={styles.featureIcon}><f.icon size={18} /></span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== REASSURANCE STRIP ===== */}
      <section className={styles.reassure}>
        <div className={styles.reassureInner}>
          <span><FiLock size={14} /> Two separate login systems for your business and platform admins</span>
          <span><FiShield size={14} /> Every staff action recorded in an audit trail</span>
          <span><FiCreditCard size={14} /> Payments and refunds handled through Paystack</span>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className={styles.pricing} id="pricing">
        <motion.div className={styles.sectionHead} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <span className={styles.eyebrowDark}>Simple pricing</span>
          <h2>One plan per shop. Upgrade whenever you outgrow it.</h2>
        </motion.div>
        <div className={styles.pricingGrid}>
          {mockPlans.map((plan, i) => (
            <motion.div
              className={`${styles.priceCard} ${plan.name === 'Growth' ? styles.priceCardFeatured : ''}`}
              key={plan.id}
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } } }}
            >
              {plan.name === 'Growth' && <span className={styles.priceBadge}>Most popular</span>}
              <h3>{plan.name}</h3>
              <div className={styles.priceAmount}>
                <span className={styles.priceCurrency}>₦</span>{plan.price.toLocaleString()}
                <span className={styles.priceInterval}>/{plan.interval}</span>
              </div>
              <p className={styles.priceLimits}>Up to {plan.userLimit} user{plan.userLimit === 1 ? '' : 's'} · {plan.productLimit.toLocaleString()} products</p>
              <ul className={styles.priceFeatures}>
                {plan.features.map((feat) => (
                  <li key={feat}><FiCheck size={14} /> {feat}</li>
                ))}
              </ul>
              <Link to="/register" className={plan.name === 'Growth' ? styles.priceCtaFilled : styles.priceCtaOutline}>
                Start with {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaGlow} />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <h2>Ready to know your numbers?</h2>
          <p>Set up your shop on BizPilot in a few minutes. No card required to start.</p>
          <Link to="/register" className={styles.ctaPrimary}>Create your account <FiArrowRight size={16} /></Link>
        </motion.div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.brand}><FiZap size={17} /> BizPilot</div>
          <p>Business management, built for the way Nigerian SMEs actually work.</p>
          <div className={styles.footerLinks}>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
            <Link to="/admin/login" className={styles.footerAdmin}>Platform team login</Link>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} BizPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
