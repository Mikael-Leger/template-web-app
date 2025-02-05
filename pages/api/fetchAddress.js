export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = await req.body;

  const apiKey = process.env.GEOAPIFY_API_KEY;
  
  const filterCountries = ['be'];
  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}`;
  if (filterCountries.length > 0) {
    url += '&filter=countrycode:';
    filterCountries.forEach((filterCountry, index) => {
      if (index !== 0) {
        url += ',';
      }
      url += filterCountry;
    });
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      res.status(200).json({ data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error sending email', error });
    });
}
