import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { DEMO_PASSWORD, DEMO_USERNAME } from '../constants/auth';

type LoginPageProps = {
  onSuccess: () => void;
};

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShake(false);

    if (!username.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      setError("Nom d'utilisateur ou mot de passe incorrect");
      window.requestAnimationFrame(() => setShake(true));
      window.setTimeout(() => setShake(false), 420);
      return;
    }

    setError('');
    onSuccess();
  };

  const clearError = () => {
    setError('');
    setShake(false);
  };

  return (
    <main className="login-page">
      <section className={`login-card${shake ? ' login-card--shake' : ''}`} aria-labelledby="login-title">
        <header className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">BF</div>
          <div className="login-brand-copy">
            <div className="login-brand-name">Brico Farssi</div>
            <div className="login-brand-sub">Quincaillerie &amp; ferrures</div>
          </div>
          <div className="login-store">Magasin Tanger – Dar Tounsi</div>
        </header>

        <div className="login-intro">
          <h1 className="login-title" id="login-title">Connexion</h1>
          <p className="login-subtitle">Connectez-vous pour accéder à la caisse</p>
        </div>

        <form className="login-form" onSubmit={submitLogin} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="login-username">Nom d’utilisateur</label>
            <div className="login-input-wrap">
              <UserRound className="login-field-icon" size={19} aria-hidden="true" />
              <input
                className="login-input"
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="Votre nom d’utilisateur"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  clearError();
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                data-testid="input-login-username"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Mot de passe</label>
            <div className="login-input-wrap">
              <LockKeyhole className="login-field-icon" size={19} aria-hidden="true" />
              <input
                className="login-input login-password-input"
                id="login-password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError();
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                data-testid="input-login-password"
              />
              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={passwordVisible}
                data-testid="button-toggle-password"
              >
                {passwordVisible
                  ? <EyeOff size={19} aria-hidden="true" />
                  : <Eye size={19} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="login-feedback" aria-live="polite" aria-atomic="true">
            {error && <p className="login-error" id="login-error" role="alert">{error}</p>}
          </div>

          <button className="login-submit" type="submit" data-testid="button-login-submit">
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
