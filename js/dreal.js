var _dreals = _regions_2017;

fetchPromise()
  .then(function(res) {
    _data = res;
    var labels = ['DREAL', 'DEAL'];
    var organizations = filterOrganization(_data.facets.organization, labels);

    prepareRegions(organizations);
    setColors(_dreals);
    initMap(_dreals);
  });
