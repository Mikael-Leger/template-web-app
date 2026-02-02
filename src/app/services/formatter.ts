const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, '');        // Remove leading/trailing hyphens
};

export { capitalizeFirstLetter, slugify };