async function getRaindropData(accessToken) {
  const response = await fetch(
    'https://api.raindrop.io/rest/v1/raindrops/39745673',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.items.sort(sortItems).map(getSimpleData);
}

function sortItems(a, b) {
  return b.sort - a.sort;
}

function getSimpleData(item) {
  return {
    title: item.title,
    link: item.link,
  };
}

module.exports = { getRaindropData };
