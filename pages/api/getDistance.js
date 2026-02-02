export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address1, address2 } = await req.body;

  const apiKey = process.env.GEOAPIFY_API_KEY;
  const country = 'Belgium';

  const geocodeUrl = (fullAddress) => `  https://api.geoapify.com/v1/geocode/search?housenumber=${fullAddress.number}&street=${fullAddress.address}&postcode=${fullAddress.zipCode}&city=${fullAddress.city}&country=${country}&lang=en&limit=5&format=json&apiKey=${apiKey}`;

  const [response1, response2] = await Promise.all([
    fetch(geocodeUrl(address1)),
    fetch(geocodeUrl(address2))
  ]);

  const data1 = await response1.json();
  const data2 = await response2.json();

  if (!data1.results.length || !data2.results.length) {
    console.error('Une ou les deux adresses sont invalides.');

    return res.status(400).json({
      error: 'Invalid address',
      message: 'One or both addresses could not be geocoded'
    });
  }

  const matrixUrl = `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`;
  const location1 = [data1.results[0].lon, data1.results[0].lat];
  const location2 = [data2.results[0].lon, data2.results[0].lat];
  
  const body = JSON.stringify({
    sources: [
      { location: location1 }
    ],
    targets: [
      { location: location2 }
    ],
    mode: 'drive'
  });

  const matrixResponse = await fetch(matrixUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
  });

  const matrixData = await matrixResponse.json();

  if (matrixData.error) {
    console.error('Erreur lors du calcul de la distance :', matrixData.error);

    return res.status(500).json({
      error: 'Distance calculation failed',
      message: matrixData.error
    });
  }

  const {distance} = matrixData.sources_to_targets[0][0];

  res.status(200).json({ distance });
}
