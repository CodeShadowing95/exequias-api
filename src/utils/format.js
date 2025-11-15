export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Échec de la validation';

  if (Array.isArray(errors.issues))
    return errors.issues.map(issue => issue.message).join(', ');

  return JSON.stringify(errors);
};
