const pages = [
  {
    title: 'home'
  },
  {
    title: 'products'
  },
  {
    title: 'order',
    value: 100
  }
];

const calculateMarginTop = () => {

  for (const page of pages) {
    const foundSelector = document.querySelector(`.${page.title}`);
    if (foundSelector) return 112 + (page.value ?? 0);
  }

  return 0;
};

export { calculateMarginTop };