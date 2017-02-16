var _regions = regions_2017;
var selectedRegion = null;

var facetsPromise = fetch('https://inspire.data.gouv.fr/api/geogw/records?availability=yes&opendata=yes&facets.organization=10000&resultParts=facets&facets%5Bcatalog%5D=0&facets%5Bkeyword%5D=0')
  .then(function(response) {
    return response.json()
  })
  .catch(function(err) {
    console.log(err);
    return [];
  });

var regionsPromises = fetch('https://geo.api.gouv.fr/regions')
  .then(function(response) {
    return response.json()
  })
  .catch(function(err) {
    console.log(err);
    return [];
  });

function getPos(str) {
  var pos = str.indexOf(' ');

  if (pos <= 4 || pos + 1 === str.length) {
    return -1;
  }

  return pos;
}

function getName(organization) {
  var pos = getPos(organization.value);
  return organization.value.substring(pos + 1, organization.value.lenght);
}

function getAcronym(organization) {
  var pos = getPos(organization.value);
  return organization.value.substring(0, pos);
}

function filterOrganization(organizations) {
  var labels = ['DRAAF', 'DAAF', 'DRIAAF'];
  var matchs = [];

  for (var i = 0; i < labels.length; i++) {
    for (var y = 0; y < organizations.length; y++) {
      var acronym = getAcronym(organizations[y])

      if (acronym === labels[i]) {
        matchs.push(organizations[y])
      };
    }
  }

  return matchs;
}

function matchDRAAFAndRegion(organization) {
  var organizationName = getName(organization);
  var region = matchDRAAFAndNewRegion(organizationName)

  if (region) {
    organization.status = 'new';
  } else {
    region = matchDRAAFAndOldRegion(organizationName)
    organization.status = 'old';
  }

  if (region) setOrganization(organization, region);

  return region
}

function matchDRAAFAndNewRegion(organizationName) {
  return getRegion(organizationName);
}

function matchDRAAFAndOldRegion(organizationName) {
  for (var i = 0; i < newRegionsMatch.length; i++) {
    for (var y = 0; y < newRegionsMatch[y].draaf.length; y++) {
      if (newRegionsMatch[i].draaf[y] === organizationName) {
        return getRegion(newRegionsMatch[i].region.nom);
      }
    }
  }
}

function getRegion(regionName) {
  for (var i = 0; i < _regions.length; i++) {
    if (_regions[i].nom === regionName) {
      return _regions[i];
    }
  }
}

function setOrganization(organization, region) {
  if (!region.organizations) {
    region.organizations = [];
  }
  region.organizations.push(organization)
}

function setStatus(organization) {
  if (status === '' || !organization.status) {
    organization.status = status
  } else if (true) {

  }
  return region
}

function getColor(element, region) {
  var organizations = region.organizations

  if (organizations && element.style.fill === '') {
    for (var i = 0; i < organizations.length; i++) {
      if (organizations[i].status === 'new') {
        return '#c6fbc3';
      }
      return '#eff2a3';
    }
  }
  return '';
}

function drawRegions() {
  for (var i = 0; i < _regions.length; i++) {
    var element = document.getElementById('svg').getElementById(_regions[i].code);

    if (element) {
      element.style.fill = getColor(element, _regions[i]);
    } else {
      console.log('Le région %s [%s] n\'est pas sur la carte.', _regions[i].nom, _regions[i].code);
    }
  }
}

function displayInfos(evt) {
  var dataNb = 0;
  var regionNode = evt.target.id ? evt.target : evt.target.parentNode;

  resetRegionInfos();
  selectedRegion = regionNode;
  regionNode.style.strokeWidth = '3px';
  for (var i = 0; i < _regions.length; i++) {
    if (_regions[i].code === regionNode.id) {
      if (_regions[i].organizations) {
        for (var y = 0; y < _regions[i].organizations.length; y++) {
          dataNb += _regions[i].organizations[y].count;
        }
      }
      document.getElementById('region_name').innerHTML = 'Région : <b>' + _regions[i].nom + '</b>';
      document.getElementById('data_nb').innerHTML = 'Nombre de données éligibles : <b>' + dataNb + '</b>';
    }
  }
}

function resetRegionInfos() {
  if (selectedRegion) {
    selectedRegion.style.strokeWidth = '1px';
  }
}

document.getElementById('svg')
  .addEventListener('load', function() {
    facetsPromise
      .then(function(response) {
        var facets = response.facets;
        var organizations = filterOrganization(facets.organization);

        organizations.map(function(organization) {
          var match = matchDRAAFAndRegion(organization);
          if (!match) console.log('Erreur avec l\'organisation: ', organization);
        })
        drawRegions();
      })

      var regions = document.querySelectorAll('#regions_fxx *[id]');
      for(var i = 0; i < regions.length; i++) {
        regions[i].addEventListener('click', displayInfos);
        // regions[i].addEventListener('mouseenter', displayInfos);
      }
    });
