import { AppShell } from '../_components/AppShell';
import { ContactForm } from '../_components/ContactForm';

export const metadata = {
  title: 'Contact — FPL Ranker',
  description: 'Got a question, suggestion or partnership idea? Get in touch with the FPL Ranker team.',
};

export default function Page() {
  return (
    <AppShell title="Contact" backHref="/app/home" meta="We'd love to hear from you">
      <div className="content" style={{ maxWidth: 880 }}>
        <div className="scr-head" style={{ marginBottom: 16 }}>
          <div><div className="scr-title">CONTACT US</div><div className="scr-sub">Question, suggestion or partnership idea?</div></div>
        </div>
        <ContactForm />
      </div>
    </AppShell>
  );
}
