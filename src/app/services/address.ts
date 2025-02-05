import { FullAddress } from '../interfaces/address.interface';

async function autocompleteAddress(query: string | undefined, suggestionsElement: HTMLDivElement | null, onClick: (_fullAddress: FullAddress) => void) {
  if (query === undefined || query.length < 3 || suggestionsElement === null) {
    return;
  }

  const apiKey = '6a77c643f9eb416395576bb4b4a3a307';
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
      const suggestions = data.features;
      suggestionsElement.innerHTML = '';

      for (let index = 0; index < Math.min(suggestions.length, 3); index++) {
        const suggestion = suggestions[index];
        const suggestionDiv = document.createElement('div');

        const suggestionFormatted = suggestion.properties.formatted;
        suggestionDiv.textContent = suggestionFormatted;

        suggestionDiv.addEventListener('click', () => {
          const fullAddressFormated: FullAddress = {
            address: suggestion.properties.address_line1,
            zipCode: suggestion.properties.postcode,
            city: suggestion.properties.city
          };
          
          onClick(fullAddressFormated);
        });
        suggestionsElement.appendChild(suggestionDiv);
      }

    })
    .catch(error => {
      console.error(error);
    });
}

export {autocompleteAddress};