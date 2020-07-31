import { promises as fs } from 'fs';

async function start() {
  const states = JSON.parse(await fs.readFile('./data/Estados.json'));
  const cities = JSON.parse(await fs.readFile('./data/Cidades.json'));

  // generate and populate files
  const statesPerId = await generateStateFiles(states);
  const citiesPerState = separateCities(cities, statesPerId);
  await populateStateFiles(citiesPerState);

  // operations
  const statesAndNumCities = await getStatesAndNumberOfCities(states);
  showThe5LargestStates(statesAndNumCities);
  showThe5SmallestStates(statesAndNumCities);

  // const citiesNameAndState = getCitiesNameAndStateSorted(cities, statesPerId);
  const longestNamesPerState = showCityWithLongestName(citiesPerState);
  const shorterNamesPerState = showCityWithShorterName(citiesPerState);

  showLongestCityName(longestNamesPerState);
  showShorterCityName(shorterNamesPerState);
}

function showShorterCityName(shorterNamesPerState) {
  const sortByNameLength = (a, b) => {
    const cityA = a.split(' - ')[0];
    const cityB = b.split(' - ')[0];

    const lenDiff = cityA.length - cityB.length;
    if (lenDiff !== 0) { return lenDiff; }
    return cityA.localeCompare(cityB);
  };
  const orderedNames = shorterNamesPerState.sort(sortByNameLength);
  // console.log(orderedNames)
  console.log(`\nMenor nome de cidade:\n${orderedNames.shift()}`);
}

function showLongestCityName(longestNamesPerState) {
  const sortByNameLength = (a, b) => {
    const cityA = a.split(' - ')[0];
    const cityB = b.split(' - ')[0];

    const lenDiff = cityA.length - cityB.length;
    if (lenDiff !== 0) { return lenDiff; }
    return cityA.localeCompare(cityB);
  };
  const orderedNames = longestNamesPerState.sort(sortByNameLength);
  // console.log(orderedNames)
  console.log(`\nMaior nome de cidade:\n${orderedNames.pop()}`);
}

function showCityWithShorterName(citiesPerState) {
  const shorterNames = [];
  for (const [uf, cities] of Object.entries(citiesPerState)) {
    const orderedCities = getCitiesNameSorted(cities)
    const text = `${orderedCities.shift()} - ${uf}`;
    shorterNames.push(text);
  }

  console.log('\nMenores nomes:\n', shorterNames);
  return shorterNames;
}

function showCityWithLongestName(citiesPerState) {
  const longestNames = [];
  for (const [uf, cities] of Object.entries(citiesPerState)) {
    const orderedCities = getCitiesNameSorted(cities)
    const text = `${orderedCities.pop()} - ${uf}`;
    longestNames.push(text);
  }
  console.log('\nMaiores nomes:\n', longestNames);
  return longestNames;
}

function getCitiesNameSorted(cities) {
  let cityNames = [];
  cities.forEach(city =>  {
    cityNames.push(city['Nome']);
  })
  
  const sortAscFunc = (a, b) => {
    if (a.length === b.length) {
      return a.localeCompare(b)
    }
    return a.length - b.length;
  }
  cityNames.sort(sortAscFunc);

  return cityNames;
}

function showThe5LargestStates(statesAndNumCities) {
  const sortPerNumberOfCitiesDec = (a, b) => b.numberOfCities - a.numberOfCities;  
  const statesOrdered = statesAndNumCities.sort(sortPerNumberOfCitiesDec);

  const fiveLargestStates = [];
  for (let index = 0; index < 5; index++) {
    const { state, numberOfCities } = statesOrdered[index];
    const text = `${state} - ${numberOfCities}`;
    fiveLargestStates.push(text);
  }

  console.log('\n5 largest states in number of cities:\n',fiveLargestStates);
}

function showThe5SmallestStates(statesAndNumCities) {
  const sortPerNumberOfCitiesAsc = (a, b) => a.numberOfCities - b.numberOfCities;  
  const statesOrdered = statesAndNumCities.sort(sortPerNumberOfCitiesAsc);

  let fiveLargestStates = [];
  for (let index = 0; index < 5; index++) {
    const { state, numberOfCities } = statesOrdered[index];
    const text = `${state} - ${numberOfCities}`;
    fiveLargestStates.push(text);
  }

  fiveLargestStates = fiveLargestStates.reverse();

  console.log('\n5 smallest states in number of cities:\n',fiveLargestStates);
}

async function getStatesAndNumberOfCities(states) {
  let numCitiesPerState = [];

  for (const state of states) {
   numCitiesPerState.push({
      state: state['Sigla'],
      numberOfCities: await countCities(state['Sigla'])
    });
  }

  return numCitiesPerState;
}

async function countCities(state) {
  if (!state) { return null; }

  try {
    const listOfCities = JSON.parse(await fs.readFile(`./generated/${state}.json`));
    return listOfCities.length;
  } catch (err) {
    console.log('\nAn error occurred\n', err);
    return null;
  }
}

async function populateStateFiles(citiesPerState) {
  for (const [state, cities] of Object.entries(citiesPerState)) {
    const filePath = `./generated/${state}.json`;
    try {
      await fs.appendFile(filePath, JSON.stringify(cities));
    } catch (err) {
      console.log('\nAn error occurred\n', err);
      return;
    }
  }
}

function separateCities(cities, statesPerId) {
  const citiesPerState = {};
  for (const city of cities) {
    const stateId = city['Estado'];
    const stateInitials = statesPerId[stateId];
    
    citiesPerState[stateInitials] = [...citiesPerState[stateInitials] || [], city];
  }

  return citiesPerState;
}

async function generateStateFiles(states) {
  const statesPerId = {};

  for (const state of states) {
    statesPerId[state.ID] = state.Sigla;
    try {
      await fs.writeFile(`./generated/${state.Sigla}.json`, '');
    } catch (err) {
      console.log('\nAn error occurred\n', err);
      return null;
    }
  }

  return statesPerId;
}

start();