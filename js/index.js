var _selectedSegment = null;
var _data = null;

var fetchPromise = function() {
  var url = 'https://inspire.data.gouv.fr/api/geogw/records?availability=yes&opendata=yes&facets.organization=10000&resultParts=facets&facets[catalog]=0&facets[keyword]=0';

  if (!_data) {
    return fetch(url)
      .then(function(response) {
        return response.json()
      })
      .catch(function(err) {
        console.log(err);
        return [];
      });
  } else {
    return Promise(function(resolve, reject) {
      resolve(_data);
    })
  }
}

function getElementNode(evt) {
  return evt.target.id ? evt.target : evt.target.parentNode;
}

function focusSegment(evt) {
  var regionNode = getElementNode(evt);

  regionNode.style.strokeWidth = '5px';
  regionNode.style.cursor = 'pointer';
  regionNode.style.stroke = "#4183c4";
}

function unfocusSegment(evt) {
  var regionNode = getElementNode(evt);

  if (regionNode !== _selectedSegment) {
    regionNode.style.strokeWidth = '1px';
  }
  regionNode.style.stroke="black";
}

function resetSegment() {
  if (_selectedSegment) {
    _selectedSegment.style.strokeWidth = '1px';
  }
}


function colorizeMap(data) {
  var element = null;

  data.forEach(function(organization) {
    var svg = document.getElementsByTagName('svg');

    for (var i = 0; i < svg.length; i++) {
      var elem = svg[i].getElementById(organization.code);
      if (elem) elem.style.fill = organization.color;
    }
  })
}

function initMap(data) {
  colorizeMap(data);
  var segments = document.querySelectorAll('svg g *[id]');
  segments.forEach(function(segment) {
    segment.addEventListener('click', displayInfos);
    segment.addEventListener('mouseenter', focusSegment);
    segment.addEventListener('mouseout', unfocusSegment);
  })
}
