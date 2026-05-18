import * as yup from 'yup';
import { Nationality } from '../enums/nationality.enum';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordField = yup
  .string()
  .matches(
    passwordRegex,
    'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
  )
  .required('Password is required');

const nameWithNationalityTest = yup
  .string()
  .required('Name is required')
  .min(3, 'Name must be at least 3 characters')
  .test('check-name-by-nationality', 'Name is invalid', function (value) {
    const { nationality } = this.parent;
    if (!value || !nationality) return true;

    if (nationality === Nationality.US) {
      if (!/^[\x00-\x7F]+$/.test(value)) {
        return this.createError({ message: 'For US, name must contain only 1-byte (ASCII) characters.' });
      }
      return true;
    }
    if (nationality === Nationality.JAPAN) {
      if (!/^[^\x00-\x7F]+$/.test(value)) {
        return this.createError({ message: 'For Japan, name must contain only multi-byte characters.' });
      }
      return true;
    }
    return true;
  });

export const userCoreFields = {
  email: yup.string().email('Invalid email format').required('Email is required'),
  name: nameWithNationalityTest,
  nationality: yup
    .string()
    .oneOf(Object.values(Nationality), 'Invalid nationality')
    .required('Nationality is required'),
  balance: yup
    .number()
    .transform(v => (isNaN(v) ? 0 : v))
    .default(0)
    .min(0, 'Balance cannot be negative'),
};

export const updateUserSchema = yup.object().shape({
  ...userCoreFields,
});

export const registerSchema = yup.object().shape({
  ...userCoreFields,
  password: passwordField,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Confirm password does not match')
    .required('Please confirm your password'),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const changePasswordSchema = yup.object().shape({
  oldPassword: yup.string().required('Please enter your current password'),
  newPassword: passwordField,
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Confirm password does not match')
    .required('Please confirm your new password'),
});

export type UpdateUserDto = yup.InferType<typeof updateUserSchema>;
export type RegisterDto = yup.InferType<typeof registerSchema>;
export type LoginDto = yup.InferType<typeof loginSchema>;
export type ChangePasswordDto = yup.InferType<typeof changePasswordSchema>;
