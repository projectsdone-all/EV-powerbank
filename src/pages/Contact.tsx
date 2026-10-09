import { useState } from 'react';
import { Phone, Mail, MessageSquare, Send } from 'lucide-react';
import { useApp } from '../hooks/useAppContext';

export default function Contact() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      addToast('Message sent successfully. We will get back to you soon!', 'success');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-dark">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Need Help?</h1>
          <p className="text-lg text-text-secondary">
            Our support team is available 24/7 to assist you with emergency requests, billing questions, or general inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center mb-4">
              <Phone size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Call Support</h3>
            <p className="text-text-secondary text-sm mb-4">For immediate emergency assistance.</p>
            <a href="tel:18001234567" className="text-accent-green font-bold hover:underline">1800-123-4567</a>
          </div>
          
          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-accent-cyan/10 text-accent-cyan flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Chat Support</h3>
            <p className="text-text-secondary text-sm mb-4">Chat with our support agents in real-time.</p>
            <button className="text-accent-cyan font-bold hover:underline" onClick={() => addToast('Chat initiated (Demo)', 'info')}>Start Chat</button>
          </div>
          
          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-elevated text-text-primary border border-brand-border-light flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Support</h3>
            <p className="text-text-secondary text-sm mb-4">For general inquiries and feedback.</p>
            <a href="mailto:support@evassist.demo" className="text-text-primary font-bold hover:underline">support@evassist.demo</a>
          </div>
        </div>

        <div className="max-w-2xl mx-auto card bg-brand-surface border border-brand-border p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Send a Request</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="label-field">Full Name</label>
                <input id="name" type="text" required className="input-field" placeholder="Tejaraj" />
              </div>
              <div>
                <label htmlFor="phone" className="label-field">Phone Number</label>
                <input id="phone" type="tel" required className="input-field" placeholder="+91 98765 43210" />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="label-field">Email Address</label>
              <input id="email" type="email" required className="input-field" placeholder="tejaraj@example.com" />
            </div>
            
            <div>
              <label htmlFor="issue" className="label-field">Issue Type</label>
              <select id="issue" required className="input-field bg-brand-dark appearance-none">
                <option value="" disabled selected>Select an issue...</option>
                <option value="emergency">Emergency Assistance</option>
                <option value="billing">Billing Inquiry</option>
                <option value="feedback">Feedback/Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="label-field">Message</label>
              <textarea id="message" required rows={4} className="input-field resize-none" placeholder="How can we help you?"></textarea>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : (
                <span className="flex items-center gap-2">
                  <Send size={18} /> Send Request
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
