fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: '[out:json];(node["amenity"="hospital"](around:15000,12.9716,77.5946);way["amenity"="hospital"](around:15000,12.9716,77.5946);relation["amenity"="hospital"](around:15000,12.9716,77.5946););out center 20;'
}).then(r=>r.json()).then(d=>console.log(d.elements.map(e=>e.tags?.name)));
