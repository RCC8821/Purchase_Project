import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Real API function
const loginAPI = async (email, password) => {
  try {
    const response = await fetch( `${import.meta.env.VITE_BACKEND_URL}/api/login` , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }

    return { success: true, token: result.token, userType: result.userType };
  } catch (error) {
    throw new Error('Network error. Please try again.');
  }
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (error) {
        setError('');
      }
    },
    [error]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await loginAPI(formData.email.trim(), formData.password);

      if (result.success) {
        // Map backend userType to frontend roles
        const userTypeMap = {
          'Admin': 'admin',
          'Anish': 'Anish',
          'Aakash Chouhan': 'Aakash Chouhan',
          'Ravi Rajak': 'Ravi Rajak',
          'Anjali Malviya': 'Anjali Malviya',
          'Neha Masani': 'Neha Masani',
          'Gourav Singh': 'Gourav Singh',
          'Somesh Chadhar': 'Somesh Chadhar'
        };
        const frontendUserType = userTypeMap[result.userType] || 'user';

        // Save to localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('userType', frontendUserType);
        console.log('Saved to localStorage:', { token: result.token, userType: frontendUserType });

        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized components
  const FloatingShapes = React.memo(() => (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${60 + i * 10}px`,
              height: `${60 + i * 10}px`,
              left: `${20 + i * 20}%`,
              top: `${10 + i * 20}%`,
              background: `linear-gradient(45deg, rgb(147, 51, 234), rgb(219, 39, 119))`,
              animation: `float${i} ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes float0 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-10px) rotate(90deg) scale(1.05); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-15px) rotate(90deg) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(90deg) scale(1.05); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-25px) rotate(90deg) scale(1.05); }
        }
      `}</style>
    </>
  ));

  const ParticleSystem = React.memo(() => (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingShapes />
      <ParticleSystem />
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div
          className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
            mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          <div className="backdrop-blur-md bg-gray-900/60 border border-gray-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" />
            <div className="absolute inset-[1px] rounded-3xl bg-gray-900/80" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400"
                      style={{ animation: 'spin 3s linear infinite' }}
                    />
                    <div className="absolute inset-2 rounded-full bg-gray-900" />
                    <img
                      src="/rcc-logo.png"
                      alt="RCC Logo"
                      className="w-12 h-12 relative z-10 object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-3">
                  Welcome Back
                </h1>
                <p className="text-gray-400 text-lg">Sign in to continue your journey</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-5 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500 text-lg transition-all duration-300"
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-5 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 hover:border-gray-500 text-lg transition-all duration-300"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-900/30 border border-red-700/50 rounded-xl p-4 animate-pulse">
                    <span className="block">⚠️ {error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white relative overflow-hidden transition-all duration-300 ${
                    isLoading || !formData.email.trim() || !formData.password.trim()
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-95'
                  }`}
                >
                  <div className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <span>✨ Sign In</span>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #9333ea, #db2777);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7c3aed, #be185d);
        }
        input:focus {
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
        }
        input[type="email"],
        input[type="password"] {
          font-size: 16px;
        }
        @media (max-width: 768px) {
          input[type="email"],
          input[type="password"] {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;