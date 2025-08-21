import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Grid, Typography, LinearProgress } from '@mui/material';

function decodeJwt(token: string | null): any | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

const GuestDashboard: React.FC = () => {
  const [now, setNow] = useState(Date.now());
  const payload = useMemo(() => decodeJwt(localStorage.getItem('campus_token')), []);

  const expMs = payload?.exp ? payload.exp * 1000 : null;
  const iatMs = payload?.iat ? payload.iat * 1000 : null;

  // Update every 10s to refresh countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = expMs ? Math.max(0, expMs - now) : null;
  const totalMs = expMs && iatMs ? expMs - iatMs : null;
  const progress = totalMs && expMs ? Math.min(100, Math.max(0, ((now - iatMs!) / totalMs) * 100)) : undefined;

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        You are in Guest mode with limited access. Data is read-only and changes will not be saved.
      </Alert>

      {remainingMs !== null ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Session expiry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Your guest session will expire in approximately {Math.ceil(remainingMs / 60000)} minute(s).
            </Typography>
            {progress !== undefined && (
              <LinearProgress variant="determinate" value={progress} />
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Guest session expiry time not available. Sessions typically last a short period and may end at any time.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Welcome to the Guest Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                Explore sample widgets and navigation. Upgrade to a full account to unlock all features.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>What you can do</Typography>
              <Typography variant="body2" color="text.secondary">
                View public announcements, events, and demo data. Certain actions are disabled in guest mode.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GuestDashboard;
