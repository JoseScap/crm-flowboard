// src/lib/google-oauth.ts

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI_FOR_CONNECTORS

if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
  throw new Error('Google Client ID or Redirect URI is not configured');
}

// Scopes necesarios para Google Calendar
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export const initiateGoogleOAuth = (businessEmployeeId: number) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured');
  }

  // Generar un state único para prevenir CSRF
  const state = btoa(JSON.stringify({ 
    businessEmployeeId, 
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(7)
  }));

  // Guardar el state en sessionStorage
  sessionStorage.setItem('google_oauth_state', state);

  // Construir la URL de autorización
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES);
  authUrl.searchParams.set('access_type', 'offline'); // Necesario para obtener refresh_token
  authUrl.searchParams.set('prompt', 'consent'); // Forzar consent para obtener refresh_token
  authUrl.searchParams.set('state', state);

  // Redirigir al usuario a Google
  window.location.href = authUrl.toString();
};

export const handleGoogleCallback = async (code: string, state: string) => {
  // Verificar el state
  const savedState = sessionStorage.getItem('google_oauth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter');
  }

  const stateData = JSON.parse(atob(state));
  const { businessEmployeeId } = stateData;

  // Limpiar el state
  sessionStorage.removeItem('google_oauth_state');

  // Intercambiar el código por tokens
  // NOTA: Esto normalmente se hace en el backend por seguridad
  // Por ahora, lo haremos aquí, pero deberías moverlo al backend
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json();
    throw new Error(`Failed to exchange code for tokens: ${error.error_description || error.error}`);
  }

  const tokens = await tokenResponse.json();

  // Obtener información del usuario
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  const userInfo = await userInfoResponse.json();

  return {
    businessEmployeeId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    scope: tokens.scope,
    providerUserId: userInfo.id,
    providerEmail: userInfo.email,
  };
};

