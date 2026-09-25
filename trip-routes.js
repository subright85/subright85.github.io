// Illustrative home-to-destination links, never an inferred itinerary between trips.
function prepareTripRoutes(journey, visits) {
  return visits.filter(p => ['travel', 'visit'].includes(p.status) && p.month && p.coordinates).flatMap(place => {
    const stays = journey.stops.filter(s => s.arrived && s.arrived <= place.month && (!s.departed ? s.current : s.departed >= place.month));
    if (stays.length !== 1) return [];
    const home = journey.locations[stays[0].location];
    if (!home?.coordinates || home.coordinates.every((v,i) => Math.abs(v - place.coordinates[i]) < .01)) return [];
    return [{id: place.id, place, home, coordinates: [home.coordinates, place.coordinates], label: `${home.city} → ${place.city}`, month: place.month}];
  });
}
if (typeof module !== 'undefined') module.exports = {prepareTripRoutes};
