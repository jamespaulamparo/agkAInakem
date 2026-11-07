import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import ClearDeviceData from '../components/ClearDeviceData'
import { ResearchToggle, UsageToggle } from '../components/StatsToggle'
import { DPO, PRIVACY_VERSION } from '../lib/privacy'
import { useI18n } from '../lib/i18n'

function S({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink-muted [&_strong]:text-ink [&_a]:font-semibold [&_a]:text-teal-ink [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  )
}

export default function Privacy() {
  const { lang } = useI18n()
  const dpo = <a href={DPO.url} target="_blank" rel="noreferrer">{DPO.handle}</a>
  return (
    <Page className="pt-14 sm:pt-20">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Privacy Notice &amp; Terms</h1>
        <p className="mt-3 text-sm text-ink-faint">Version {PRIVACY_VERSION} · Republic Act No. 10173 (Data Privacy Act of 2012) and its Implementing Rules</p>

        <div className="mt-8 rounded-lg bg-teal-soft px-5 py-4 text-sm leading-relaxed">
          <p className="font-semibold">{lang === 'fil' ? 'Buod' : 'In short'}</p>
          {lang === 'fil'
            ? <p className="mt-1">Magagamit ang lahat nang walang account. Ang tina-type mo para maghanap ng salita ay hindi sine-save. Bumibilang lang kami nang hindi nagpapakilala kung gaano kadalas ginagamit ang bawat bahagi (hal. “ginamit ang paghinga”), para mapabuti ang site; puwede itong i-off. Kung walang account, nasa browser mo lang ang journal, plano at mga contact. Kung gagawa ka ng account, pribado ang journal mo at para sa iyo lang; maaari mo itong i-download o burahin kahit kailan. Hindi namin ibinebenta o ibinabahagi ang data mo. May tanong? Makipag-ugnayan kay {dpo}.</p>
            : <p className="mt-1">Everything works without an account. What you type to find words is never saved. We count, anonymously, how often each part of the site is used (for example “breathing exercise finished”) to improve it and for research; you can turn this off. Without an account, your journal, plan and contacts stay in your browser. If you create an account, your journal is private to you, and you can download or delete it any time. We never sell or share your data. Questions? Contact {dpo}.</p>}
        </div>

        <S id="who" title="1. Who we are and how to reach us">
          <p>agkAInakem is a mental health literacy and early-support website and browser extension. For this notice, the project team is the <strong>personal information controller</strong>.</p>
          <p><strong>Data Protection Officer / privacy contact:</strong> {dpo}. Contact them for any question, request or concern about your data.</p>
        </S>

        <S id="collect" title="2. What we collect, and why">
          <p><strong>If you don’t create an account</strong>, we don’t keep personal information about you on our server.</p>
          <ul>
            <li>Text you type to find words is processed in memory to suggest words, then discarded. It is not stored or logged.</li>
            <li>Your journal, safety plan, contacts, reminders, saved words and settings are stored <strong>only in your browser</strong> (localStorage). We can’t see them.</li>
            <li>Location sharing and messages to your contacts happen through <strong>your own phone apps</strong>. Your location is never sent to us.</li>
          </ul>
          <p><strong>If you create an account</strong> (optional), we process:</p>
          <ul>
            <li>Email address, optional name, and your password stored only as a secure hash, to let you sign in.</li>
            <li>Journal entries: date, colour, feeling words and optional note. These are <strong>sensitive personal information</strong> (information about health) and are processed only with your explicit consent, so the journal can follow you across devices.</li>
            <li>A record of your consent (date and notice version), as required by law.</li>
            <li>Essential cookies: a session cookie to keep you signed in and a security (CSRF) cookie. No advertising or tracking cookies.</li>
          </ul>
          <p id="usage"><strong>Anonymous usage counts</strong> (everyone, unless turned off): when you use a feature, the site adds 1 to a daily counter, such as “breathing exercise finished”, “page viewed: dictionary”, “call tapped: crisis line”, “word viewed: burnout”, or the type of device (phone/computer) and language. Each counter stores only the date, the event name and a label from a fixed list. It never includes what you type, your journal, contacts, phone numbers dialled, location, IP address, cookies or any ID, so it can’t be linked to you and is not personal information. We use the totals to see which help is used, improve the site, and for research and reports about mental health literacy. It turns off automatically if your browser sends Global Privacy Control or Do Not Track.</p>
          <UsageToggle />
          <p id="research"><strong>Research statistics</strong> (account holders, only if you opt in, off by default): totals of journal colours, weekdays and feeling words from everyone who opted in may be used in anonymous research charts. Notes are never used. Groups smaller than 5 people are hidden so no one can be singled out. You can opt out any time in your Account or here; your entries are then left out of future statistics.</p>
          <ResearchToggle />
          <p><strong>Browser extension:</strong> it reads only text you select or hover over while holding the chosen key. Hovered words are matched on your device; only a dictionary word is looked up on our server, and it is not stored.</p>
        </S>

        <S id="basis" title="3. Legal basis">
          <p>We process account and journal data on the basis of your <strong>consent</strong> (Sections 12(a) and 13(a), RA 10173), which you give when you create an account. You can withdraw it at any time by deleting your account. Including your journal in research statistics needs a separate, optional consent (Section 13(a)) that you can withdraw separately. Anonymous usage counts are not personal information.</p>
        </S>

        <S id="share" title="4. Who can see your data">
          <ul>
            <li>Only you. Journal entries are not shown in the site’s admin pages, and the team does not read them. The team’s dashboard shows totals only.</li>
            <li>We do <strong>not</strong> sell, rent or share your data, and we don’t use it for advertising, profiling or training AI.</li>
            <li>We share nothing with schools, employers, barangays or other organisations.</li>
            <li>We would disclose data only if required by law or a lawful order, and would tell you where allowed.</li>
          </ul>
        </S>

        <S id="keep" title="5. How long we keep it">
          <p>Account data and journal entries are kept until you delete them. Deleting your account permanently erases your account, journal and consent records right away. Password-reset links expire after 3 days. Data in your browser stays until you erase it (see below) or clear your browser.</p>
        </S>

        <S id="security" title="6. How we protect it">
          <ul>
            <li>Passwords are hashed (never stored in readable form); sign-in uses secure session cookies and CSRF protection.</li>
            <li>Encrypted connections (HTTPS) when the site is deployed; rate limits on sign-in and other sensitive actions.</li>
            <li>Data minimisation: we collect only what the features need. Usage statistics are anonymous daily totals; research statistics are opt-in and shown only for groups of 5 or more.</li>
            <li>If a personal data breach happens, we will notify the National Privacy Commission and affected users within 72 hours of knowing about it, as required by NPC Circular 16-03.</li>
          </ul>
        </S>

        <S id="rights" title="7. Your rights, and how to use them">
          <p>Under RA 10173 you have the right to:</p>
          <ul>
            <li><strong>Be informed</strong> — this notice.</li>
            <li><strong>Access</strong> and <strong>data portability</strong> — Account → “Download my data” gives you everything we hold, as a file.</li>
            <li><strong>Correct</strong> (rectification) — edit any journal entry in the Journal; contact {dpo} to correct account details.</li>
            <li><strong>Object</strong> and <strong>withdraw consent</strong>, and <strong>erasure or blocking</strong> — Account → “Delete account and journal” erases everything at once.</li>
            <li><strong>Damages</strong> for inaccurate, unlawfully obtained or unauthorised use of your data.</li>
            <li><strong>File a complaint</strong> with the National Privacy Commission: <a href="https://privacy.gov.ph" target="_blank" rel="noreferrer">privacy.gov.ph</a>.</li>
          </ul>
          <p>To erase what’s stored in this browser:</p>
          <ClearDeviceData />
        </S>

        <S id="minors" title="8. Children and young people">
          <p>The help, dictionary and calm-down features need no account. To create an account you must be 18 or older, or have the permission of a parent or guardian.</p>
        </S>

        <S id="others" title="9. Other people’s information">
          <p>Contacts you add (names and numbers) stay only on your device and are used only when you choose to call or text them. Please add people who would be comfortable being contacted by you.</p>
        </S>

        <S id="third" title="10. Other services">
          <ul>
            <li>Your phone’s calling and messaging apps, when you tap call or text.</li>
            <li>The “How it’s made” page loads technology logos from the jsDelivr CDN (open-source Simple Icons); this shares your IP address with that CDN when you open that page.</li>
            <li>The hosting or tunnel provider used to run the site may keep standard server logs (such as IP addresses).</li>
          </ul>
        </S>

        <S id="terms" title="11. Terms of use">
          <ul>
            <li><strong>Not medical care, not an emergency service.</strong> agkAInakem gives mental health information and first-aid support. It does not diagnose, treat, or replace a qualified professional. If you or someone else is in danger, call <a href="tel:911">911</a> or the NCMH crisis line <a href="tel:1553">1553</a>.</li>
            <li>Dictionary entries are educational, written in our own words with the references listed on each entry, and are awaiting expert review.</li>
            <li>We follow the principles of the Mental Health Act (RA 11036): respect, confidentiality, informed consent and non-discrimination.</li>
            <li>Hotline numbers are checked but can change; we can’t guarantee every service’s availability.</li>
            <li>Please use the site respectfully and lawfully. Don’t try to access other people’s accounts or disrupt the service.</li>
          </ul>
        </S>

        <S id="changes" title="12. Changes to this notice">
          <p>If we change how we handle data, we’ll update this page and its version date, and ask for your consent again where the law requires it.</p>
        </S>

        <p className="border-t border-line pt-6 text-sm"><Link to="/about" className="font-semibold text-teal-ink">About &amp; safety →</Link></p>
      </article>
    </Page>
  )
}
