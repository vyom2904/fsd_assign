import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, GraduationCap, Home, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'owner', label: 'Owner', icon: Home },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function Auth() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { login, register } = useAuth();
  const isRegister = params.get('mode') === 'register';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = isRegister
        ? await register(form.name.trim(), form.email.trim(), form.password, form.role)
        : await login(form.email.trim(), form.password);
      nav(u.role === 'owner' ? '/owner' : u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (ex) {
      setErr(ex.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-bronze/60';

  return (
    <div className="mx-auto max-w-md px-3 py-16">
      <div className="rounded-[24px] border border-white/[0.08] bg-surface p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">StayScout</p>
        <h1 className="mt-2 font-serif text-3xl text-white">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {isRegister && (
            <input className={input} placeholder="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          )}
          <input className={input} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className={input} type="password" placeholder="Password (min 6 chars)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />

          {isRegister && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setForm({ ...form, role: id })}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                    form.role === id ? 'border-bronze bg-bronze/10 text-bronze' : 'border-white/10 text-white/50 hover:border-white/25'}`}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}

          <button disabled={busy} type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
            {busy ? '…' : isRegister ? <><UserPlus size={15} /> Create account</> : <><LogIn size={15} /> Sign in</>}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-white/40">
          {isRegister ? (
            <>Already a member? <Link className="text-bronze hover:underline" to="/auth?mode=login">Sign in</Link></>
          ) : (
            <>New here? <Link className="text-bronze hover:underline" to="/auth?mode=register">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
