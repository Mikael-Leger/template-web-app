const calculateMarginTop = () => {
  const pages = [
    {
      title: 'home',
      value: 400
    },
    {
      title: 'products',
      value: 200
    },
    {
      title: 'order',
      value: 200
    }
  ];

  for (const page of pages) {
    const foundSelector = document.querySelector(`.${page.title}`);
    if (foundSelector) return page.value;
  }

  return 0;
};

export { calculateMarginTop };