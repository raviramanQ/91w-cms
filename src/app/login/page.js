'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect to home page
      router.push('/home')
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with Speedometer and Car */}
      <div className="absolute inset-0 bg-black">
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
        
        {/* Speedometer on right side */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-60">
          <div className="absolute right-0 top-0 w-full h-1/2">
            {/* Speedometer SVG representation */}
            <div className="absolute right-10 top-10 w-96 h-96">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Speedometer arc */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#1a1a1a" strokeWidth="20" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#ff6b00" strokeWidth="3" strokeDasharray="10 5" opacity="0.5" />
                {/* Speed markers */}
                {[...Array(9)].map((_, i) => {
                  const angle = -135 + (i * 30);
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 100 + 70 * Math.cos(rad);
                  const y1 = 100 + 70 * Math.sin(rad);
                  const x2 = 100 + 85 * Math.cos(rad);
                  const y2 = 100 + 85 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="2" />;
                })}
                {/* Speed numbers */}
                <text x="140" y="60" fill="#999" fontSize="14" fontWeight="bold">6</text>
                <text x="165" y="95" fill="#999" fontSize="14" fontWeight="bold">4</text>
                <text x="165" y="135" fill="#999" fontSize="14" fontWeight="bold">2</text>
                <text x="100" y="165" fill="#999" fontSize="14" fontWeight="bold" textAnchor="middle">0</text>
                {/* Needle */}
                <line x1="100" y1="100" x2="160" y2="80" stroke="#ff6b00" strokeWidth="3" />
                <circle cx="100" cy="100" r="8" fill="#ff6b00" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Car wheel on bottom right */}
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-80">
          <div className="absolute right-0 bottom-0 w-full h-full">
            {/* Wheel SVG */}
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Tire */}
              <circle cx="150" cy="150" r="120" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="2" />
              <circle cx="150" cy="150" r="110" fill="#1a1a1a" />
              {/* Rim */}
              <circle cx="150" cy="150" r="80" fill="#2a2a2a" stroke="#ff6b00" strokeWidth="1" opacity="0.3" />
              {/* Spokes */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const x = 150 + 75 * Math.cos(angle);
                const y = 150 + 75 * Math.sin(angle);
                return <line key={i} x1="150" y1="150" x2={x} y2={y} stroke="#3a3a3a" strokeWidth="3" />;
              })}
              {/* Center cap */}
              <circle cx="150" cy="150" r="25" fill="#1a1a1a" stroke="#ff6b00" strokeWidth="2" opacity="0.5" />
              {/* Orange brake caliper glow */}
              <circle cx="150" cy="150" r="60" fill="none" stroke="#ff6b00" strokeWidth="8" opacity="0.2" />
            </svg>
          </div>
        </div>
        
        {/* Particle effects */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg w-full relative z-20 px-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-blue-400 px-8 py-4 rounded-full shadow-lg">
            <img 
              src="/images/91wheels-logo.svg" 
              alt="91Wheels Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Login Form Card with Orange Glow Border */}
        <div className="relative">
          {/* Outer glow border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 rounded-3xl opacity-75 blur-sm"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-orange-500/30">
            {/* Corner screws */}
            <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-gray-700 border border-gray-600"></div>
            <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-gray-700 border border-gray-600"></div>
            <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-gray-700 border border-gray-600"></div>
            <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-gray-700 border border-gray-600"></div>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-orange-500 uppercase tracking-wide mb-2">DRIVE 91WHEELS</h1>
              <p className="text-gray-400 text-sm">Access 91Wheels Command Center</p>
              {/* Diamond divider */}
              <div className="flex justify-center items-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-orange-500 transform rotate-45"></div>
                <div className="w-2 h-2 bg-orange-500 transform rotate-45"></div>
                <div className="w-2 h-2 bg-orange-500 transform rotate-45"></div>
                <div className="w-2 h-2 bg-orange-500 transform rotate-45"></div>
              </div>
            </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-900/50 p-4 border-2 border-red-600 animate-shake backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-200">{error}</span>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-orange-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-700/50 rounded-lg bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-orange-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3.5 border border-gray-700/50 rounded-lg bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Please fill in this field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-orange-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 text-base font-bold rounded-lg text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] transition-all duration-200 shadow-lg shadow-orange-600/30 hover:shadow-orange-500/50 uppercase tracking-wide"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    SIGN IN
                  </>
                )}
              </button>
            </div>
            
            {/* Forgot Password */}
            <div className="text-center">
              <button type="button" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>

       
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
