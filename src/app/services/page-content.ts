const calculateMarginTop = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return 0;

  return navbar.getBoundingClientRect().height;
};

export { calculateMarginTop };