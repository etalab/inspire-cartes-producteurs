var _regions = _regions_2017;

fetchPromise()
  .then(function(res) {
    _data = res;
    var labels = ['DRAAF', 'DAAF', 'DRIAAF'];
    var organizations = filterOrganization(_data.facets.organization, labels);

    prepareRegions(organizations);
    setColors(_regions);
    initMap(_regions);
  });
