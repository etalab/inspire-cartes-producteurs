function filterOrganization(organizations, labels) {
  var posMax = getShortessLabel(labels);
  var matchs = [];

  labels.forEach(function(label) {
    organizations.forEach(function(organization) {
      var acronym = getAcronym(organization.value, posMax)
      if (acronym === label) {
        matchs.push(organization)
      };
    })
  })

  return matchs;
}

function prepareRegions(organizations) {
  organizations.forEach(function(organization) {
    var region = matchDRAAFAndRegion(organization);
    if (region) {
      setOrganization(organization, region);
    } else {
      if (!region) console.log('Erreur avec l\'organisation: ', organization);
    }
  })
}

function matchDRAAFAndRegion(organization) {
  var organizationName = getName(organization.value);
  var region = getRegion(organizationName);

  if (!region) region = matchDRAAFAndOldRegion(organizationName)

  return region
}

function matchDRAAFAndOldRegion(organizationName) {
  for (var i = 0; i < _newRegionsMatch.length; i++) {
    for (var y = 0; y < _newRegionsMatch[y].draaf.length; y++) {
      if (_newRegionsMatch[i].draaf[y] === organizationName) {
        return getRegion(_newRegionsMatch[i].region.nom);
      }
    }
  }
}

function getRegion(regionName) {
  for (var i = 0; i < _regions_2017.length; i++) {
    if (_regions_2017[i].nom === regionName) {
      return _regions_2017[i];
    }
  }
}

function setOrganization(organization, region) {
  if (!region.organizations) {
    region.organizations = [];
  }
  region.organizations.push(organization)
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

function setColors(regions) {
  regions.forEach(function(region) {
    if (region.organizations && region.organizations.length) {
      region.color = '#eff2a3';
      region.organizations.forEach(function(organization) {
        if (getName(organization.value) === region.nom) region.color = '#c6fbc3';
      })
    }
  })
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
  var regionNode = getElementNode(evt);

  resetSegment();
  _selectedSegment = regionNode;
  regionNode.style.strokeWidth = '4px';

  for (var i = 0; i < _regions_2017.length; i++) {
    if (_regions_2017[i].code === regionNode.id) return _regions_2017[i];
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

  document.getElementById('region_name').innerHTML = '<b>' + region.nom + '</b>';
  document.getElementById('data_nb').innerHTML = 'Nombre de données éligibles : <b>' + data + '</b>';

  displayData(region);
}
