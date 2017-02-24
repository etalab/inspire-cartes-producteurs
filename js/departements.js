var _departements = _departements_2017;

fetchPromise()
  .then(function(res) {
    _data = res;
    var organizations = filterOrganization(_data.facets.organization);
    prepareDepartements(organizations);
    setColors(_departements);
    initMap(_departements);
  });

function filterOrganization(organizations) {
  var labels = ['DDT', 'DDTM'];
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

function prepareDepartements(organizations) {
  organizations.forEach(function(organization) {
    var departement = matchDDTAndDepartement(organization);
    if (departement) departement.ddt = organization;
  })
}

function matchDDTAndDepartement(organization) {
  var organizationName = getName(organization.value);
  var departement = getDepartement(organizationName);
  return departement;
}

function getDepartement(departementName) {
  for (var i = 0; i < _departements_2017.length; i++) {
    if (_departements_2017[i].nom === departementName) {
      return _departements_2017[i];
    }
  }
}


function createOrganizationsList(departement) {
  var div = document.createElement('div');

  if (departement.ddt.count) {
    var a = document.createElement('a');

    a.href = 'https://inspire.data.gouv.fr/search?availability=yes&opendata=yes&organization=' +  departement.ddt.value;
    a.innerHTML = departement.ddt.count + ' jeux de données';
    div.innerHTML = departement.ddt.value + ' : ';
    div.appendChild(a);
  }

  return div;
}

function setColors(departements) {
  departements.forEach(function(departement) {
    if (departement.ddt && departement.ddt.count) departement.color = '#c6fbc3';
  });
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

function getDepartementFromMap(evt) {
  var elementNode = getElementNode(evt);

  resetSegment();
  _selectedSegment = elementNode;
  elementNode.style.strokeWidth = '4px';

  for (var i = 0; i < _departements.length; i++) {
    if (_departements[i].code === elementNode.id) return _departements[i];
  }
}

function displayData(departement) {
  var inspireDiv = document.getElementById('inspire')
  var list = createOrganizationsList(departement);

  if (inspireDiv.hasChildNodes()) {
    inspireDiv.removeChild(inspireDiv.childNodes[0]);
  }
  inspireDiv.appendChild(list);
}

function displayInfos(evt) {
  var departement = getDepartementFromMap(evt);
  var data = departement.ddt ? departement.ddt.count : 0;

  document.getElementById('departement_name').innerHTML = '<b>' + departement.nom + '</b>';
  document.getElementById('data_nb').innerHTML = 'Nombre de données éligibles : <b>' + data + '</b>';

  displayData(departement);
}
