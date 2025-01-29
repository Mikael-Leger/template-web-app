const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${day}/${month}/${year}`;
};

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);

  return new Date(year, month - 1, day);
};

export { formatDate, parseDate };