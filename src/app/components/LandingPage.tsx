import { Heart, Shield, Lock, Activity, Eye, Zap, Users, ArrowRight, CheckCircle2, Video, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToSignup }: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Multi-Factor Authentication',
      description: 'Secure access with OTP verification and password protection'
    },
    {
      icon: Lock,
      title: '256-bit AES Encryption',
      description: 'Military-grade encryption for all patient data at rest and in transit'
    },
    {
      icon: Activity,
      title: 'Audit Logging',
      description: 'Complete activity tracking and integrity checks for accountability'
    },
    {
      icon: Eye,
      title: 'Billing Verification',
      description: 'Secure payment processing with transaction validation'
    },
    {
      icon: Zap,
      title: 'Encrypted Telemedicine',
      description: 'End-to-end encrypted video consultations with doctors'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions for patients, doctors, and administrators'
    }
  ];

  const stats = [
    { label: 'Active Patients', value: '50K+' },
    { label: 'System Uptime', value: '99.9%' },
    { label: 'Security Score', value: '100%' },
    { label: 'HIPAA Compliant', value: 'Yes' }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/5 to-secondary/10 -z-10" />
      <div className="absolute inset-0 opacity-30 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">As-Shifa</h1>
                <p className="text-xs text-muted-foreground">Secure Healthcare</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onNavigateToLogin}
                variant="outline"
                className="px-6 py-2 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                Login
              </Button>
              <Button
                onClick={onNavigateToSignup}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg transition-all hover:scale-105"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">HIPAA Compliant • SOC 2 Certified</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Secure Healthcare
                  <span className="block text-primary">Management System</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Enterprise-grade security meets seamless healthcare management.
                  Protect patient data with military-grade encryption, multi-factor authentication,
                  and comprehensive audit trails.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={onNavigateToSignup}
                  size="lg"
                  className="px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-lg font-semibold shadow-xl shadow-primary/30 transition-all hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">Zero Trust Architecture</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative backdrop-blur-2xl bg-white/60 border border-white/40 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-20 -z-10 animate-pulse" />

                {/* Floating Animation Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">Live Now!</span>
                </div>

                {/* Security Features Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 transform hover:translate-x-2 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">MFA Enabled</p>
                      <p className="text-sm text-green-700">Two-factor authentication active</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 transform hover:translate-x-2 transition-all duration-300 delay-75">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Data Encrypted</p>
                      <p className="text-sm text-blue-700">All patient records secured</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 transform hover:translate-x-2 transition-all duration-300 delay-150">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900">Telemedicine Ready</p>
                      <p className="text-sm text-purple-700">Encrypted video consultations</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 transform hover:translate-x-2 transition-all duration-300 delay-200">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900">Audit Logging</p>
                      <p className="text-sm text-orange-700">Complete activity tracking</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Enterprise Security Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with security-first architecture to protect sensitive healthcare data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = [
                'from-green-500 to-emerald-600',
                'from-blue-500 to-cyan-600',
                'from-purple-500 to-pink-600',
                'from-orange-500 to-red-600',
                'from-indigo-500 to-purple-600',
                'from-teal-500 to-green-600'
              ];
              return (
                <div
                  key={index}
                  className="relative backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-3xl blur transition-opacity from-primary to-secondary" />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[index]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/40">
                    <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative backdrop-blur-2xl bg-gradient-to-br from-primary/10 via-purple-50/50 to-secondary/10 border border-primary/20 rounded-3xl shadow-2xl p-12 text-center overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-3xl opacity-10 -z-10 animate-pulse" />

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl -z-10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Start Your Free Trial Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ready to Secure Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Healthcare Data?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare providers protecting patient information with enterprise-grade security
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={onNavigateToSignup}
                  size="lg"
                  className="px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-semibold shadow-xl shadow-primary/30 transition-all hover:scale-105"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={onNavigateToLogin}
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 rounded-xl border-2 bg-white/80 backdrop-blur-sm text-lg font-semibold transition-all hover:scale-105"
                >
                  Sign In
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">24/7 support included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-foreground">As-Shifa Healthcare</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Secure Healthcare Management System
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 As-Shifa. All rights reserved. HIPAA Compliant • SOC 2 Certified • ISO 27001
          </p>
        </div>
      </footer>
    </div>
  );
}
