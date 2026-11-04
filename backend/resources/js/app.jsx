import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Toolbar,
  Typography, createTheme, ThemeProvider,
} from '@mui/material';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#285c4d' }, background: { default: '#f5f7f4' } },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
});

function cookie(name) {
  return document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))?.split('=').slice(1).join('=');
}

async function api(path, options = {}) {
  const method = options.method ?? 'GET';
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  const token = cookie('XSRF-TOKEN');
  if (token && !['GET', 'HEAD'].includes(method)) headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, method, headers,
    body: options.body ? JSON.stringify(options.body) : undefined });
  if (response.status === 204) return null;
  const payload = await response.json();
  if (!response.ok) {
    const message = payload.message ?? Object.values(payload.errors ?? {}).flat()[0] ?? 'No se pudo completar la operación.';
    throw new Error(message);
  }
  return payload;
}

const labels = {
  open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', closed: 'Cerrada',
  low: 'Baja', normal: 'Normal', high: 'Alta', urgent: 'Urgente',
};

function App() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState('');
  const [supportUsers, setSupportUsers] = useState([]);

  const loadTickets = useCallback(async () => {
    if (!user) return;
    const query = new URLSearchParams();
    if (filter) query.set('status', filter);
    const result = await api(`/tickets?${query}`);
    setTickets(result.data);
  }, [user, filter]);

  useEffect(() => {
    api('/csrf-cookie').then(() => api('/user'))
      .then(({ user: current }) => setUser(current))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) loadTickets().catch((problem) => setError(problem.message));
  }, [user, loadTickets]);

  useEffect(() => {
    if (user?.role === 'support') api('/support-users')
      .then(({ data }) => setSupportUsers(data))
      .catch((problem) => setError(problem.message));
  }, [user]);

  async function authenticate(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      await api('/csrf-cookie');
      const result = await api(mode === 'login' ? '/login' : '/register', { method: 'POST', body });
      setUser(result.user);
    } catch (problem) { setError(problem.message); }
  }

  async function createTicket(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await api('/tickets', { method: 'POST', body: Object.fromEntries(form.entries()) });
      setTickets((items) => [result.data, ...items]);
      setOpenCreate(false);
      setSelected(result.data);
      setError('');
    } catch (problem) { setError(problem.message); }
  }

  async function selectTicket(ticket) {
    try { setSelected((await api(`/tickets/${ticket.id}`)).data); setError(''); }
    catch (problem) { setError(problem.message); }
  }

  async function updateTicket(field, value) {
    try {
      const result = await api(`/tickets/${selected.id}`, { method: 'PATCH', body: { [field]: value } });
      setSelected(result.data);
      setTickets((items) => items.map((ticket) => ticket.id === result.data.id ? result.data : ticket));
    } catch (problem) { setError(problem.message); }
  }

  async function addComment(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/tickets/${selected.id}/comments`, { method: 'POST', body: Object.fromEntries(form.entries()) });
      setSelected((await api(`/tickets/${selected.id}`)).data);
      event.currentTarget.reset();
    } catch (problem) { setError(problem.message); }
  }

  async function logout() {
    try { await api('/logout', { method: 'POST' }); } finally {
      setUser(null); setTickets([]); setSelected(null);
    }
  }

  if (loading) return <Box className="center-state"><CircularProgress /></Box>;
  if (!user) return <Container maxWidth="sm" className="auth-wrap">
    <Card className="auth-card"><CardContent>
      <Typography variant="overline" color="primary">MESA DE AYUDA</Typography>
      <Typography variant="h4" fontWeight={700} gutterBottom>{mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}</Typography>
      <Typography color="text.secondary" mb={3}>Gestiona tus solicitudes en un solo lugar.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack component="form" spacing={2} onSubmit={authenticate}>
        {mode === 'register' && <TextField name="name" label="Nombre" required autoComplete="name" />}
        <TextField name="email" label="Correo electrónico" type="email" required autoComplete="email" />
        <TextField name="password" label="Contraseña" type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} inputProps={{ minLength: mode === 'login' ? undefined : 12 }} />
        {mode === 'register' && <TextField name="password_confirmation" label="Confirma la contraseña" type="password" required />}
        <Button type="submit" variant="contained" size="large">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Button>
      </Stack>
      <Button sx={{ mt: 2 }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? '¿Nuevo aquí? Crear cuenta' : 'Ya tengo una cuenta'}
      </Button>
    </CardContent></Card>
  </Container>;

  return <Box>
    <AppBar position="sticky" color="inherit" elevation={0} className="topbar"><Toolbar className="toolbar">
      <Box className="brand-mark">S</Box><Typography fontWeight={700} sx={{ flexGrow: 1 }}>Support Desk</Typography>
      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>{user.name[0]}</Avatar>
      <Typography variant="body2" sx={{ mr: 2 }}>{user.name}</Typography><Button onClick={logout}>Salir</Button>
    </Toolbar></AppBar>
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Box className="page-heading">
        <Box><Typography variant="overline" color="primary">{user.role === 'support' ? 'CENTRO DE SOPORTE' : 'MI ESPACIO'}</Typography>
          <Typography variant="h4" fontWeight={700}>{user.role === 'support' ? 'Cola de incidencias' : 'Mis incidencias'}</Typography>
          <Typography color="text.secondary" mt={1}>{user.role === 'support' ? 'Revisa, prioriza y da seguimiento a las solicitudes.' : 'Consulta tus solicitudes y conversa con el equipo.'}</Typography>
        </Box>
        {user.role !== 'support' && <Button variant="contained" onClick={() => setOpenCreate(true)}>Nueva incidencia</Button>}
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Box className={selected ? 'workspace has-detail' : 'workspace'}>
        <Card className="list-card"><CardContent>
          <Box className="list-toolbar"><Typography variant="h6" fontWeight={700}>Solicitudes</Typography>
            {user.role === 'support' && <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="filter-label">Estado</InputLabel><Select labelId="filter-label" label="Estado" value={filter} onChange={(event) => setFilter(event.target.value)}>
                <MenuItem value="">Todos</MenuItem>{Object.entries(labels).slice(0, 4).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
              </Select></FormControl>}
          </Box>
          {tickets.length === 0 ? <Box className="empty-state"><Typography variant="h6">Aún no hay incidencias</Typography><Typography color="text.secondary">Cuando registres una solicitud, aparecerá aquí.</Typography></Box> :
            <Stack divider={<Divider />} spacing={0}>{tickets.map((ticket) => <Box key={ticket.id} className={selected?.id === ticket.id ? 'ticket-row active' : 'ticket-row'} onClick={() => selectTicket(ticket)}>
              <Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={600} noWrap>{ticket.subject}</Typography>
                <Typography variant="caption" color="text.secondary">#{ticket.id} · {new Date(ticket.created_at).toLocaleDateString('es-SV')}</Typography>
                {user.role === 'support' && <Typography display="block" variant="caption" color="text.secondary">{ticket.requester?.name}</Typography>}</Box>
              <Stack alignItems="flex-end" spacing={0.75}><Chip size="small" label={labels[ticket.status] ?? ticket.status} color={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : 'default'} />
                <Typography variant="caption" color={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'error.main' : 'text.secondary'}>{labels[ticket.priority]}</Typography></Stack>
            </Box>)}</Stack>}
        </CardContent></Card>
        {selected && <Card className="detail-card"><CardContent>
          <Button size="small" onClick={() => setSelected(null)}>← Volver a la lista</Button>
          <Typography variant="overline" display="block" color="text.secondary" mt={2}>INCIDENCIA #{selected.id}</Typography>
          <Typography variant="h5" fontWeight={700}>{selected.subject}</Typography>
          <Stack direction="row" spacing={1} mt={1.5}><Chip size="small" label={labels[selected.status]} /><Chip size="small" label={labels[selected.priority]} variant="outlined" /></Stack>
          <Typography mt={2} sx={{ whiteSpace: 'pre-wrap' }}>{selected.description}</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>Creada por {selected.requester?.name}</Typography>
          {user.role === 'support' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={2}>
            <FormControl size="small" fullWidth><InputLabel>Estado</InputLabel><Select label="Estado" value={selected.status} onChange={(event) => updateTicket('status', event.target.value)}>{Object.entries(labels).slice(0, 4).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" fullWidth><InputLabel>Prioridad</InputLabel><Select label="Prioridad" value={selected.priority} onChange={(event) => updateTicket('priority', event.target.value)}>{Object.entries(labels).slice(4).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" fullWidth><InputLabel>Responsable</InputLabel><Select label="Responsable" value={selected.assignee?.id ?? ''} onChange={(event) => updateTicket('assignee_id', event.target.value || null)}><MenuItem value="">Sin asignar</MenuItem>{supportUsers.map((person) => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}</Select></FormControl>
          </Stack>}
          <Divider sx={{ my: 3 }} /><Typography variant="h6" fontWeight={700} mb={2}>Conversación</Typography>
          <Stack spacing={1.5} mb={2}>{selected.comments?.map((comment) => <Box className="comment" key={comment.id}>
            <Typography variant="subtitle2">{comment.user.name}<Typography component="span" variant="caption" color="text.secondary"> · {new Date(comment.created_at).toLocaleString('es-SV')}</Typography></Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{comment.body}</Typography>
          </Box>)}
            {selected.comments?.length === 0 && <Typography color="text.secondary">Todavía no hay comentarios.</Typography>}</Stack>
          <Stack component="form" direction="row" spacing={1} onSubmit={addComment}>
            <TextField name="body" placeholder="Escribe una respuesta…" size="small" fullWidth required multiline maxRows={4} />
            <Button type="submit" variant="contained">Enviar</Button>
          </Stack>
        </CardContent></Card>}
      </Box>
    </Container>
    <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={createTicket}><DialogTitle>Nueva incidencia</DialogTitle><DialogContent>
        <Stack spacing={2} pt={1}><TextField name="subject" label="Asunto" required inputProps={{ maxLength: 160 }} />
          <TextField name="description" label="Describe el problema" required multiline minRows={5} /></Stack>
      </DialogContent><DialogActions><Button onClick={() => setOpenCreate(false)}>Cancelar</Button><Button variant="contained" type="submit">Enviar solicitud</Button></DialogActions></Box>
    </Dialog>
  </Box>;
}

createRoot(document.getElementById('app')).render(<ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>);
