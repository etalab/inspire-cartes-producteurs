import { filter, includes } from 'lodash'
import regions from '../data/regions_2017.json'

console.log(regions);
const newRegionsMatch = [
  {
    "region": {
      "nom": "Auvergne-Rhône-Alpes",
      "code": "84"},
    "draaf": ["DRAAF Rhône-Alpes", "DRAAF Auvergne", "DRAAF Auvergne(Direction Régionale de l'Alimentation, de l'Agriculture et de la Forêt Auvergne)"]
  },
  {
    "region": {
      "nom": "Grand-Est",
      "code": "44"},
    "draaf": ["DRAAF Alsace", "DRAAF Lorraine"]
  },
  {
    "region": {
      "nom": "Nouvelle-Aquitaine",
      "code": "75"},
    "draaf": ["DRAAF Aquitaine", "DRAAF Poitou-Charentes", "DRAAF Limousin"]
  },
  {
    "region": {
      "nom": "Occitanie",
      "code": "76"},
    "draaf": ["DRAAF Midi-Pyrénées", "DRAAF Languedoc-Roussillon"]
  },
  {
    "region": {
      "nom": "Bourgogne-Franche-Comté",
      "code": "27"
    },
    "draaf": ["DRAAF Franche-Comté", "DRAAF Bourgogne"]
  },
  {
    "region": {
      "nom": "Hauts-de-France",
      "code": "32"
    },
    "draaf": ["DRAAF Picardie"]
  },
  {
    "region": {
      "nom": "Île-de-France",
      "code": "11"
    },
    "draaf": ["DRIAAF ILE DE FRANCE (Direction régionale et interdépartementale de l'alimentation, de l'agriculture et de la forêtd'Ile-de-France)"]
  },
  {
    "region": {
      "nom": "Provence-Alpes-Côte d'Azur",
      "code": "93"
    },
    "draaf": ["PACA"]
  }
]

const facetsPromise = fetch('https://inspire.data.gouv.fr/api/geogw/records?availability=yes&opendata=yes&facets.organization=10000&resultParts=facets&facets%5Bcatalog%5D=0&facets%5Bkeyword%5D=0')
  .then(response => response.json())
  .catch(err => {
    console.log(err);
    return []
  })

const regionsPromises = fetch('https://geo.api.gouv.fr/regions')
  .then(response => response.json())
  .catch(err => {
    console.log(err);
    return []
  })

function filterOrganization(organization) {
  const labels = ['DRAAF', 'DAAF', 'DRIAAF']
  for (var i = 0; i < labels.length; i++) {
    if (includes(organization.value, labels[i])) return true
  }
  return false
}

function matchDRAAFAndRegion(regions, organization) {
  for (var i = 0; i < regions.length; i++) {
    if (organization.value.includes(regions[i].nom)) {
      return regions[i]
    }
  }
}

function matchDRAAFAndOldRegion(newRegionsMatch, organization) {
  for (var i = 0; i < newRegionsMatch.length; i++) {
    if (includes(newRegionsMatch[i].draaf, organization.value)) {
      return newRegionsMatch[i].region
    }
  }
}

document.getElementById('svg')
  .addEventListener('load', function() {
    Promise.all([facetsPromise, regionsPromises])
      .then(response => {
        const facets = response[0].facets
        const regions = response[1]
        const svg = this.getSVGDocument();
        const organizations = filter(facets.organization, (organization) => filterOrganization(organization))

        organizations.map(organization => {
          let color = '#c6fbc3'
          let region = matchDRAAFAndRegion(regions, organization)

          if (!region) {
            color = '#eff2a3'
            region = matchDRAAFAndOldRegion(newRegionsMatch, organization)
          }

          if (region) {
            const element = svg.querySelector(`[id='${region.code}']`)

            if (element) {
              element.style.fill = color
            } else {
              console.log(`Le région ${region.nom} [${region.code}] n'est pas sur la carte.`)
            }
          } else {
            console.log('Error avec l\'organisation: ', organization)
          }

        })
      })
  })
