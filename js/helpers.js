function getPos(str, posMax) {
  var pos = str.indexOf(' ');

  if (pos < posMax || pos + 1 === str.length) {
    return -1;
  }

  return pos;
}

function getName(organizationName) {
  var pos = getPos(organizationName);
  return organizationName.substring(pos + 1, organizationName.lenght);
}

function getAcronym(organizationName, posMax) {
  var pos = getPos(organizationName, posMax);
  return organizationName.substring(0, pos);
}

function getShortessLabel(labels) {
  var shortess = labels[0].length;

  labels.forEach(function(label) {
    if (label.length < shortess) shortess = label.length;
  })

  return shortess;
}
