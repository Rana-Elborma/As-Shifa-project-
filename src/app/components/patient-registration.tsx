import { useState } from "react";
import { Button } from "./ui/button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Heart,
  Activity,
  Users,
  AlertCircle,
  ArrowLeft,
  UserCog,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { supabase } from "../../supabase";
import type { UserRole } from "../App";

interface PatientRegistrationProps {
  onBackToLanding?: () => void;
  onRegistrationSuccess?: () => void;
}

export function PatientRegistration({
  onBackToLanding,
  onRegistrationSuccess,
}: PatientRegistrationProps) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // T2: Per-field error messages
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    dateOfBirth?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === "password")
      setPasswordStrength(calculatePasswordStrength(value));
    // Clear the per-field error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleNext = () => {
    setError("");
    // T2: Validate all Step 1 fields and show per-field errors
    const newErrors: typeof fieldErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain only digits, +, -, or parentheses.";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // T2: Validate Step 2 fields with per-field errors
    const newErrors: typeof fieldErrors = {};
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (calculatePasswordStrength(formData.password) <= 50) {
      newErrors.password =
        "Password is too weak. Include uppercase, lowercase, numbers, and special characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});

    setLoading(true);

    let userId: string;

    // 1. Try to create auth account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            role: selectedRole,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
          },
        },
      },
    );

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered")
      ) {
        // Auth account exists — try to sign in to recover a partial registration
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
        if (signInError || !signInData?.user) {
          setError(
            "An account with this email already exists. Please sign in with your existing password.",
          );
          setLoading(false);
          return;
        }
        // Check whether a complete profile already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", signInData.user.id)
          .single();
        if (existingUser) {
          await supabase.auth.signOut();
          setError("This account is already fully registered. Please sign in.");
          setLoading(false);
          return;
        }
        // Profile is missing — complete the registration using this user's ID
        userId = signInData.user.id;
      } else {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else if (!signUpData.user) {
      setError("Registration failed. Please try again.");
      setLoading(false);
      return;
    } else {
      userId = signUpData.user.id;
    }

    // 2. Upsert profile in users table (upsert handles retries gracefully)
    const { error: usersError } = await supabase.from("users").upsert(
      [
        {
          id: userId,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: selectedRole,
        },
      ],
      { onConflict: "id" },
    );

    if (usersError) {
      await supabase.auth.signOut();
      setError(`Registration failed: ${usersError.message}. Please try again.`);
      setLoading(false);
      return;
    }

    // 3. Patients also get a row in the patients table
    if (selectedRole === "patient") {
      const { error: patientsError } = await supabase.from("patients").upsert(
        [
          {
            id: userId,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth || null,
          },
        ],
        { onConflict: "id" },
      );

      if (patientsError) {
        console.warn("Patient profile upsert failed:", patientsError.message);
      }
    }

    // Sign out so user starts a clean login session
    await supabase.auth.signOut();

    setLoading(false);
    onRegistrationSuccess?.();
  };

  return (
    <div className="min-h-screen p-6 pt-20">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/70 border border-white/40 hover:bg-white/90 transition-all shadow-lg z-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto items-start">
        {/* LEFT — Info panel */}
        <div className="hidden lg:flex flex-col justify-start space-y-6 relative pt-8">
          <div className="relative">
            <h2 className="text-4xl font-bold mb-4 text-primary leading-tight">
              Join a Secure
              <br />
              Healthcare Experience
            </h2>
            <p className="text-base text-muted-foreground mb-6">
              Access world-class medical services with advanced security and
              privacy protection.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Users className="w-7 h-7 text-primary mb-2" />
                <p className="text-xl font-bold text-foreground">50K+</p>
                <p className="text-xs text-muted-foreground">Active Patients</p>
              </div>
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Activity className="w-7 h-7 text-secondary mb-2" />
                <p className="text-xl font-bold text-foreground">99.9%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Heart className="w-7 h-7 text-red-500 mb-2" />
                <p className="text-xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">Support</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  HIPAA Compliant
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/40 shadow-lg">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  256-bit Encryption
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex flex-col justify-start w-full max-w-xl mx-auto lg:mx-0">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step === 1
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/60 backdrop-blur-xl border border-white/40 text-muted-foreground"
              }`}
            >
              1
            </div>
            <div className="w-16 h-1 bg-primary/20 rounded-full" />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step === 2
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/60 backdrop-blur-xl border border-white/40 text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-white/70 border border-white/40 rounded-3xl shadow-xl p-6 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Personal Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Let's start with your basic details
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      I am registering as a
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(
                        [
                          "patient",
                          "doctor",
                          "admin",
                          "receptionist",
                        ] as UserRole[]
                      ).map((role) => {
                        const icons: Record<UserRole, typeof User> = {
                          patient: User,
                          doctor: Stethoscope,
                          admin: UserCog,
                          receptionist: ClipboardList,
                        };

                        const roleLabels: Record<UserRole, string> = {
                          patient: "Patient",
                          doctor: "Doctor",
                          admin: "Admin",
                          receptionist: "Receptionist",
                        };

                        const Icon = icons[role];

                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`px-3 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                              selectedRole === role
                                ? "bg-primary text-white shadow-lg scale-105"
                                : "bg-white/50 text-muted-foreground hover:bg-white/80"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{roleLabels[role]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleChange("fullName", e.target.value)
                        }
                        placeholder="John Smith"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${fieldErrors.fullName ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Date of Birth
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleChange("dateOfBirth", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${fieldErrors.dateOfBirth ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                      />
                    </div>
                    {fieldErrors.dateOfBirth && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Email
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          placeholder="john@example.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${fieldErrors.email ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Phone
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                          placeholder="+1 (555) 000-0000"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${fieldErrors.phone ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                        />
                      </div>
                      {fieldErrors.phone && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="backdrop-blur-xl bg-gradient-to-r from-green-50/80 to-blue-50/80 border border-green-200/60 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-800">
                        Your data is protected
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>256-bit AES Encryption</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>HIPAA Compliant</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>2FA Authentication</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Audit Logging</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    Continue to Security
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Create Password
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with a strong password
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${fieldErrors.password ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Password strength:{" "}
                          <span
                            className={
                              passwordStrength >= 75
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </p>
                      </div>
                    )}
                    {fieldErrors.password && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-400 ring-2 ring-red-200' : 'border-white/40'} bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Encryption notice */}
                  <div className="backdrop-blur-xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/60 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-semibold text-blue-800 text-sm">
                          Encrypted Account Protection
                        </p>
                        <p className="text-xs text-blue-700">
                          Your password is hashed and stored securely. We use
                          industry-leading security to protect your account and
                          medical data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-4 h-4 rounded border-2 border-primary/30 text-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-primary font-semibold hover:underline"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-primary font-semibold hover:underline"
                      >
                        Privacy Policy
                      </button>
                      , and consent to secure storage of my health information.
                    </span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      variant="outline"
                      className="flex-1 py-5 rounded-xl border-2 backdrop-blur-xl bg-white/50 hover:bg-white/80 transition-all"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {loading ? "Creating Account…" : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
