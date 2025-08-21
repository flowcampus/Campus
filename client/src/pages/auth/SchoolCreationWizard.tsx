import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Step, StepLabel, Stepper, TextField, Typography, MenuItem, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { schoolsAPI } from '../../services/api';

const steps = ['School Details', 'Locale', 'Levels', 'Owner Admin'];

const validationSchemas = [
  yup.object({
    schoolName: yup.string().required('School name is required'),
    schoolEmail: yup.string().email('Valid email required').required('School email is required'),
    schoolType: yup.string().oneOf(['nursery', 'primary', 'secondary', 'tertiary', 'mixed']).required('School type is required'),
    phone: yup.string().optional(),
    motto: yup.string().optional(),
  }),
  yup.object({
    country: yup.string().required('Country is required'),
    language: yup.string().required('Language is required'),
    city: yup.string().required('City is required'),
  }),
  yup.object({
    levels: yup.array().of(yup.string()).min(1, 'Select at least one level'),
  }),
  yup.object({
    ownerFirstName: yup.string().required('First name required'),
    ownerLastName: yup.string().required('Last name required'),
    ownerEmail: yup.string().email('Valid email required').required('Owner admin email required'),
    ownerPassword: yup.string().min(6, 'At least 6 characters').required('Password required'),
    ownerPasswordConfirm: yup
      .string()
      .oneOf([yup.ref('ownerPassword')], 'Passwords must match')
      .required('Confirm your password'),
  }),
];

const levelChoices = [
  'Nursery',
  'Primary',
  'Secondary',
  'High School',
  'Elementary',
  'Middle School',
];

const SchoolCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  const formik = useFormik({
    initialValues: {
      schoolName: '',
      schoolEmail: '',
      schoolType: 'mixed',
      phone: '',
      motto: '',
      country: 'Cameroon',
      state: '',
      address: '',
      language: '',
      city: '',
      levels: [] as string[],
      ownerFirstName: '',
      ownerLastName: '',
      ownerEmail: '',
      ownerPassword: '',
      ownerPasswordConfirm: '',
    },
    validationSchema: validationSchemas[activeStep],
    onSubmit: async (values) => {
      try {
        // Final step: create school directly per backend contract
        if (activeStep === steps.length - 1) {
          setSubmitting(true);

          const payload = {
            name: values.schoolName,
            email: values.schoolEmail,
            phone: values.phone || undefined,
            address: values.address || undefined,
            city: values.city || undefined,
            state: values.state || undefined,
            country: values.country || undefined,
            type: values.schoolType,
            motto: values.motto || undefined,
            // logoUrl can be added later via upload; omit for now
            adminEmail: values.ownerEmail,
            adminPassword: values.ownerPassword,
            adminFirstName: values.ownerFirstName,
            adminLastName: values.ownerLastName,
          };

          await schoolsAPI.create(payload);
          setSnack({ open: true, message: 'School created successfully. You can now log in.', severity: 'success' });
          setSubmitting(false);
          navigate('/auth/login');
          return;
        }

        // Default: advance
        setActiveStep((s) => s + 1);
      } catch (err: any) {
        console.error('School wizard submit error', err);
        setSubmitting(false);
        const msg = err?.response?.data?.error || err?.message || 'An error occurred';
        setSnack({ open: true, message: msg, severity: 'error' });
      }
    },
  });

  const handleBack = () => setActiveStep((s) => s - 1);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="School Name"
              name="schoolName"
              value={formik.values.schoolName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.schoolName && Boolean(formik.errors.schoolName)}
              helperText={formik.touched.schoolName && (formik.errors.schoolName as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="School Email"
              name="schoolEmail"
              value={formik.values.schoolEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.schoolEmail && Boolean(formik.errors.schoolEmail)}
              helperText={formik.touched.schoolEmail && (formik.errors.schoolEmail as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              select
              fullWidth
              label="School Type"
              name="schoolType"
              value={formik.values.schoolType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.schoolType && Boolean(formik.errors.schoolType)}
              helperText={formik.touched.schoolType && (formik.errors.schoolType as string)}
              sx={{ mb: 3 }}
            >
              {['nursery', 'primary', 'secondary', 'tertiary', 'mixed'].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Phone (optional)"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && (formik.errors.phone as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Motto (optional)"
              name="motto"
              value={formik.values.motto}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.motto && Boolean(formik.errors.motto)}
              helperText={formik.touched.motto && (formik.errors.motto as string)}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              select
              fullWidth
              label="Country"
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.country && Boolean(formik.errors.country)}
              helperText={formik.touched.country && (formik.errors.country as string)}
              sx={{ mb: 3 }}
            >
              {['Cameroon', 'Nigeria', 'USA'].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Language"
              name="language"
              value={formik.values.language}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.language && Boolean(formik.errors.language)}
              helperText={formik.touched.language && (formik.errors.language as string)}
              sx={{ mb: 3 }}
            >
              {(formik.values.country === 'Cameroon' ? ['English', 'French'] : ['English']).map((l) => (
                <MenuItem key={l} value={l}>
                  {l}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="State/Region (optional)"
              name="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.state && Boolean(formik.errors.state)}
              helperText={formik.touched.state && (formik.errors.state as string)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="City"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.city && Boolean(formik.errors.city)}
              helperText={formik.touched.city && (formik.errors.city as string)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Address (optional)"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && (formik.errors.address as string)}
            />
          </>
        );
      case 2:
        return (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select the education levels this school offers.
            </Alert>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {levelChoices.map((lvl) => {
                const selected = formik.values.levels.includes(lvl);
                return (
                  <Button
                    key={lvl}
                    variant={selected ? 'contained' : 'outlined'}
                    onClick={() => {
                      const set = new Set(formik.values.levels);
                      if (set.has(lvl)) set.delete(lvl);
                      else set.add(lvl);
                      formik.setFieldValue('levels', Array.from(set));
                    }}
                  >
                    {lvl}
                  </Button>
                );
              })}
            </Box>
            {formik.touched.levels && formik.errors.levels && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {formik.errors.levels as string}
              </Typography>
            )}
          </>
        );
      case 3:
        return (
          <>
            <TextField
              fullWidth
              label="Owner First Name"
              name="ownerFirstName"
              value={formik.values.ownerFirstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ownerFirstName && Boolean(formik.errors.ownerFirstName)}
              helperText={formik.touched.ownerFirstName && (formik.errors.ownerFirstName as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Owner Last Name"
              name="ownerLastName"
              value={formik.values.ownerLastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ownerLastName && Boolean(formik.errors.ownerLastName)}
              helperText={formik.touched.ownerLastName && (formik.errors.ownerLastName as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Owner Admin Email"
              name="ownerEmail"
              value={formik.values.ownerEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ownerEmail && Boolean(formik.errors.ownerEmail)}
              helperText={formik.touched.ownerEmail && (formik.errors.ownerEmail as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Owner Password"
              name="ownerPassword"
              value={formik.values.ownerPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ownerPassword && Boolean(formik.errors.ownerPassword)}
              helperText={formik.touched.ownerPassword && (formik.errors.ownerPassword as string)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              name="ownerPasswordConfirm"
              value={formik.values.ownerPasswordConfirm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ownerPasswordConfirm && Boolean(formik.errors.ownerPasswordConfirm)}
              helperText={formik.touched.ownerPasswordConfirm && (formik.errors.ownerPasswordConfirm as string)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', px: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Create a New School
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Multi-step wizard to set up a school. You can complete verification later.
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              {renderStep()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} disabled={activeStep === 0 || submitting}>
                  Back
                </Button>
                <Button type="submit" variant="contained" sx={{ minWidth: 160 }} disabled={submitting}>
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                      Processing...
                    </>
                  ) : activeStep === steps.length - 1 ? (
                    'Create School'
                  ) : (
                    'Next'
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        autoHideDuration={4000}
        message={snack.message}
      />
    </Box>
  );
};

export default SchoolCreationWizard;
