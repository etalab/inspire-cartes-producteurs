var _regions = regions_2017;
var selectedRegion = null;

var facetsPromise = fetch('https://inspire.data.gouv.fr/api/geogw/records?availability=yes&opendata=yes&facets.organization=10000&resultParts=facets&facets[catalog]=0&facets[keyword]=0')
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

function getRegionNode(evt) {
  return evt.target.id ? evt.target : evt.target.parentNode;
}

function focusRegion(evt) {
  var regionNode = getRegionNode(evt);

  regionNode.style.strokeWidth = '5px';
  regionNode.style.cursor = 'pointer';
  regionNode.style.stroke = "#4183c4";
}

function unfocusRegion(evt) {
  var regionNode = getRegionNode(evt);

  if (regionNode !== selectedRegion) {
    regionNode.style.strokeWidth = '1px';
  }
  regionNode.style.stroke="black";
}

function createOrganizationsList(region) {
  var ul = document.createElement('ul');

  if (region.organizations) {
    region.organizations.forEach(function (organization) {
      var div = document.createElement('div');
      var a = document.createElement('a');

      a.href = 'https://inspire.data.gouv.fr/search?availability=yes&opendata=yes&organization=' +  organization.value;
      a.innerHTML = organization.count + ' jeux de données';
      div.innerHTML = organization.value + ' : ';
      div.appendChild(a);
      ul.appendChild(div);
    })
  }

  return ul;
}

function getRegionTotalCount(region) {
  var dataNb = 0;

  if (region.organizations) {
    region.organizations.forEach(function(organizations) {
      dataNb += organizations.count;
    })
  }

  return dataNb;
}

function getRegionFromMap(evt) {
  var regionNode = getRegionNode(evt);

  resetRegionInfos();
  selectedRegion = regionNode;
  regionNode.style.strokeWidth = '4px';

  for (var i = 0; i < _regions.length; i++) {
    if (_regions[i].code === regionNode.id) return _regions[i];
  }
}

function displayData(region) {
  var inspireDiv = document.getElementById('inspire')
  var list = createOrganizationsList(region);

  if (inspireDiv.hasChildNodes()) {
    inspireDiv.removeChild(inspireDiv.childNodes[0]);
  }
  inspireDiv.appendChild(list);
}

function displayInfos(evt) {
  var region = getRegionFromMap(evt);
  var data = getRegionTotalCount(region);

  displayData(region);

  document.getElementById('region_name').innerHTML = 'Région : <b>' + region.nom + '</b>';
  document.getElementById('data_nb').innerHTML = 'Nombre de données éligibles : <b>' + data + '</b>';

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

        organizations.forEach(function(organization) {
          var match = matchDRAAFAndRegion(organization);
          if (!match) console.log('Erreur avec l\'organisation: ', organization);
        })
        drawRegions();
      })

      var regions = document.querySelectorAll('#regions_fxx *[id]');
      regions.forEach(function(region) {
        region.addEventListener('click', displayInfos);
        region.addEventListener('mouseenter', focusRegion);
        region.addEventListener('mouseout', unfocusRegion);
      })
    });
