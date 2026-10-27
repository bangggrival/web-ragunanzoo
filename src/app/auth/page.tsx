"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MANAGER_PAGES } from '@/hooks/useUserPermissions';
import { AppIcon } from '@/components/ui/AppIcon';
import { z } from 'zod';
import LoadingScreen from '@/components/ui/LoadingScreen';

const BACKEND_URL = '';

const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(1, 'Username tidak boleh kosong')
    .max(100, 'Username terlalu panjang'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password terlalu panjang')
});

const signUpSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap terlalu panjang'),
  username: z.string()
    .trim()
    .min(4, 'Username minimal 4 karakter')
    .max(100, 'Username terlalu panjang'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password terlalu panjang')
});

// Get the first allowed manager page for a staff user
async function getFirstAllowedPage(userId: string): Promise<string> {
  try {
    const token = localStorage.getItem('sb-token') || '';
    const response = await fetch(`${BACKEND_URL}/api/db`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table: 'user_permissions',
        action: 'select',
        selects: 'permission_key',
        filters: [
          { type: 'eq', column: 'user_id', value: userId },
          { type: 'eq', column: 'is_allowed', value: false },
        ],
      }),
    });
    const result = await response.json();
    const deniedKeys = new Set<string>((result.data || []).map((p: any) => p.permission_key));

    for (const page of MANAGER_PAGES) {
      if (!deniedKeys.has(page.key)) {
        return page.path;
      }
    }
    return '/manager';
  } catch {
    return '/manager';
  }
}

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signOut, isAuthenticated, userRole, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    const handleRedirect = async () => {
      if (!authLoading && isAuthenticated && user) {
        if (userRole === 'admin') {
          router.replace('/manager');
        } else if (userRole === 'staff') {
          const firstPage = await getFirstAllowedPage(user.id);
          router.replace(firstPage);
        } else if (userRole === 'visitor') {
          const from = searchParams?.get('from') || '/';
          router.replace(from);
        }
      }
    };
    handleRedirect();
  }, [isAuthenticated, authLoading, userRole, user, router, signOut, searchParams]);

  useEffect(() => {
    document.title = isSignUp ? "Daftar Akun Baru - Taman Margasatwa Ragunan" : "Masuk ke Panel Pengelola - Taman Margasatwa Ragunan";
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        const validation = signUpSchema.safeParse({ name, username, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error, user: registeredUser } = await signUp(username, password, name);
        if (error) {
          const msg = error.message || '';
          if (msg.includes('exists') || msg.includes('sudah digunakan')) {
            setError('Username sudah digunakan');
          } else {
            setError(msg || 'Terjadi kesalahan saat mendaftar');
          }
          setLoading(false);
          return;
        }
        
        // Akun berhasil dibuat: arahkan ke form login, reset input agar user memasukkan dari awal
        setLoading(false);
        setIsSignUp(false);
        setName('');
        setUsername('');
        setPassword('');
        setError('');
        setSuccessMessage('Pendaftaran akun berhasil! Silakan masukkan username dan password Anda untuk masuk.');
      } else {
        const validation = loginSchema.safeParse({ username, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error, role, user: loggedInUser } = await signIn(username, password);
        if (error) {
          const msg = error.message || '';
          if (msg.includes('Invalid') || msg.includes('invalid') || msg.includes('credentials')) {
            setError('Username atau password salah');
          } else {
            setError(msg || 'Terjadi kesalahan saat login');
          }
          setLoading(false);
          return;
        }
        
        // Redirect based on role returned from signIn
        if (role === 'admin') {
          router.replace('/manager');
        } else if (role === 'staff' && loggedInUser) {
          const firstPage = await getFirstAllowedPage(loggedInUser.id);
          router.replace(firstPage);
        } else if (role === 'visitor') {
          // Visitor goes to explorer
          const from = searchParams?.get('from') || '/';
          router.replace(from);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AppIcon icon="fluent-emoji-flat:paw-prints" className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <AppIcon icon="solar:arrow-left-linear" className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Card */}
        <div className="bg-card border shadow-xl rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Panel Pengelola'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Lengkapi data Anda untuk mendaftar' : 'Masukkan kredensial Anda untuk melanjutkan'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <div className="relative">
                  <AppIcon icon="solar:user-bold-duotone" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <AppIcon icon="solar:user-bold-duotone" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin_budi"
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <AppIcon icon="solar:lock-password-bold-duotone" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-12 pr-12 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <AppIcon icon="solar:eye-closed-bold-duotone" className="w-5 h-5" /> : <AppIcon icon="solar:eye-bold-duotone" className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-start gap-2.5">
                <AppIcon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Daftar' : 'Masuk'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat autentikasi..." />}>
      <AuthForm />
    </Suspense>
  );
}
