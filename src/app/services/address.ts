import { FullAddress } from '../interfaces/address.interface';

async function autocompleteAddress(query: string | undefined, suggestionsElement: HTMLDivElement | null, onClick: (_fullAddress: FullAddress) => void) {
  if (query === undefined || query.length < 3 || suggestionsElement === null) {
    return;
  }

  const response = await fetch('/api/fetchAddress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({query}),
  });
  if (!response.ok) return;
  
  const json = await response.json();

  const suggestions = json.data.features;
  suggestionsElement.innerHTML = '';

  const maxSuggestions = 4;

  for (let index = 0; index < Math.min(suggestions.length, maxSuggestions); index++) {
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
}

async function getDistanceBetweenAddresses(address1: FullAddress, address2: FullAddress): Promise<{distance:number}> {
  const response = await fetch('/api/getDistance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({address1, address2}),
  });
  if (!response.ok) return {distance: 0};
  
  const data = await response.json();

  return data;
}

export {autocompleteAddress, getDistanceBetweenAddresses};