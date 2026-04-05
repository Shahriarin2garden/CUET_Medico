import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Phone, Mail, FileText, 
  ShieldCheck, Shield, ChevronRight, CheckCircle2,
  HeartPulse, Baby, Navigation, Video
} from 'lucide-react';
import Footer from '../components/Footer';

// Example services
const services = [
  { id: 1, name: 'General Consultation', description: 'Comprehensive health check-ups and consultations.', icon: <Stethoscope className="w-8 h-8 text-primary" /> },
  { id: 2, name: 'Pediatrics', description: 'Specialized care for infants, children, and adolescents.', icon: <Baby className="w-8 h-8 text-primary" /> },
  { id: 3, name: 'Cardiology', description: 'Expert care for heart-related conditions.', icon: <HeartPulse className="w-8 h-8 text-primary" /> },
  { id: 4, name: 'Dermatology', description: 'Diagnosis and treatment of skin disorders.', icon: <ShieldCheck className="w-8 h-8 text-primary" /> },
];

const OnlineAppointmentPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1 rounded-full mb-6">
            Schedule an Appointment
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-slate-900 tracking-tight">
            Book Your Online <span className="text-primary">Appointment</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Consult with CUET's top medical professionals from the comfort of your home. Schedule a visit in seconds.
          </p>

          <Link
            to="/appointmentform"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary/90 hover:scale-105 transition-all text-lg"
          >
            Start Booking <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Available Services Section ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Medical Services</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg hover:">Specialized departments ensuring you get exactly the care you need.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{service.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Split Section: Resources & Telehealth ── */}
      <section className="py-24 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Patient Resources */}
          <div>
            <div className="mb-10">
              <span className="inline-block bg-slate-100 text-slate-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">Quick Links</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Patient Resources</h2>
              <p className="text-slate-500">Everything you need to prepare for your physical or online visit.</p>
            </div>
            
            <div className="space-y-4">
              <Link to="/patient-forms" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors"><FileText className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 font-display">Download Patient Forms</h4>
                  <p className="text-sm text-slate-500">Save time by filling out forms beforehand.</p>
                </div>
              </Link>
              
              <Link to="/insurance-info" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors"><Shield className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 font-display">Insurance Information</h4>
                  <p className="text-sm text-slate-500">Verify what is covered by campus packages.</p>
                </div>
              </Link>
              
              <Link to="/health-tips" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors"><HeartPulse className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 font-display">Health Tips and Advice</h4>
                  <p className="text-sm text-slate-500">Browse articles written by our specialists.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Telehealth Preparation */}
          <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Video className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Telehealth Services</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Our telehealth services allow you to comfortably consult with our doctors via video. Here's how to prepare for your seamless online session:
            </p>
            
            <ul className="space-y-5">
              {[
                "Ensure you have a stable high-speed internet connection.",
                "Find a highly quiet, well-lit space for your consultation.",
                "Have your medical history and any relevant symptom logs ready.",
                "Test your microphone and webcam 5 minutes prior to the start."
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Emergency Contact Banner ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-display">Medical Emergency?</h2>
            <p className="text-red-100 text-lg max-w-lg leading-relaxed">
              Our emergency team is available around the clock. Do not wait — call us immediately for urgent campus medical assistance.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 shrink-0">
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-4">
              <Phone className="text-yellow-300 w-8 h-8 animate-pulse shrink-0" />
              <div className="text-left">
                <p className="text-xs text-red-100 font-medium uppercase tracking-wider">Hotline</p>
                <p className="text-xl md:text-2xl font-extrabold">+880 123 456 789</p>
              </div>
            </div>
            
            <a href="mailto:info@cuetmedicalcenter.edu" className="flex items-center gap-4 bg-white text-red-600 rounded-2xl px-6 py-4 hover:bg-slate-50 transition-colors shadow-lg">
              <Mail className="w-8 h-8 shrink-0" />
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Us</p>
                <p className="text-lg font-extrabold">info@cuetmedicalcenter.edu</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQs Section ── */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
             <span className="inline-block bg-slate-100 text-slate-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">Answers</span>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 border border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">What should I bring to my appointment?</h3>
              <p className="text-slate-600 leading-relaxed">Please bring your university ID, health insurance documentation (if any), and any relevant historical medical records or prescriptions.</p>
            </div>
            <div className="p-8 border border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">How can I contact the medical center?</h3>
              <p className="text-slate-600 leading-relaxed">You can reach us at the emergency hotline (+880 123 456 789) or drop us an email via info@cuetmedicalcenter.edu.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OnlineAppointmentPage;
