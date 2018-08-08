let JsonInp = `{
  "devices": [
      {
          "id": "F972B82BA56A70CC579945773B6866FB",
          "name": "Посудомоечная машина",
          "power": 950,
          "duration": 3,
          "mode": "night"
      },
      {
          "id": "C515D887EDBBE669B2FDAC62F571E9E9",
          "name": "Духовка",
          "power": 2000,
          "duration": 2,
          "mode": "day"
      },
      {
          "id": "02DDD23A85DADDD71198305330CC386D",
          "name": "Холодильник",
          "power": 50,
          "duration": 24
      },
      {
          "id": "1E6276CC231716FE8EE8BC908486D41E",
          "name": "Термостат",
          "power": 50,
          "duration": 24
      },
      {
          "id": "7D9DC84AD110500D284B33C82FE6E85E",
          "name": "Кондиционер",
          "power": 850,
          "duration": 1
      }
  ],
  "rates": [
      {
          "from": 7,
          "to": 10,
          "value": 6.46
      },
      {
          "from": 10,
          "to": 17,
          "value": 5.38
      },
      {
          "from": 17,
          "to": 21,
          "value": 6.46
      },
      {
          "from": 2,
          "to": 7,
          "value": 5.38
      },
      {
          "from": 21,
          "to": 23,
          "value": 5.38
      },
      {
          "from": 23,
          "to": 2,
          "value": 1.79
      }
  ],
  "maxPower": 2100
}`;

function smartHouse(JsonDataIn) {
    
  let JsonDataOut = {
    
    schedule: {
      "0": [],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
      "10": [],
      "11": [],
      "12": [],
      "13": [],
      "14": [],
      "15": [],
      "16": [],
      "17": [],
      "18": [],
      "19": [],
      "20": [],
      "21": [],
      "22": [],
      "23": []
    },
    
    consumedEnergy: {
      value: 0,
      devices: {}
    },
  };
  
  let inp = JSON.parse(JsonDataIn);
  
  let rates = inp.rates;
  let devices = inp.devices;
  let maxPow = inp.maxPower;
  
  let ratesDArr = [];
  let ratesNArr = [];
  let ratesUArr = rates;
  
  let iterationsb = 0;


  let timeDay = 0;
  let timeNight = 0;

  //Циклируем пока не будет полный день
  while (timeDay < 24) {

    //Заглушка от бесконечного цикла
    iterationsb++;
    if (iterationsb > 10) {
      timeDay = 24;
    }
    //Перебираем все тарифы
    for (let i = 0; i < rates.length; i++) {

      let start = rates[i].from;

      //Ночь 0 с 7
      if (start >= 0 && start < 7) {

        let end = rates[i].to;
        timeDay += end - start;

        ratesNArr.push(rates[i]);  //Заполняем массив ночных тарифов
      }

      //День с 7 до 21
      if (start >= 7 && start < 21) {

        let end = rates[i].to;
        timeDay += end - start;

        ratesDArr.push(rates[i]);  //Заполняем массив дневных тарифов
      }

      //Ночь с 21 до 24
      if (start >= 21 && start < 24) {

        let end = rates[i].to;

        //Проверка, если конец на следующий день
        end < start ? timeDay += 24 - start + end : timeDay += end - start;

        ratesNArr.push(rates[i]);  //Заполняем массив ночных тарифов
      }
    }
  }

  //Сортируем массивы по стоимости тарифов
  ratesDArr.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  ratesNArr.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  ratesUArr.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  console.log('Тарифы: ');
  console.log('ratesDArr: ', ratesDArr);
  console.log('ratesNArr: ', ratesNArr);
  console.log('ratesUArr: ', ratesUArr);
  
  //Разбиваем устройства по группам
  let devDArr = [];
  let devNArr = [];
  let devUArr = [];
  
  for (let i = 0; i < devices.length; i++) {
    
    if (devices[i].mode === 'day')
      devDArr.push(devices[i]);
    else if (devices[i].mode === 'night')
      devNArr.push(devices[i]);
    else
      devUArr.push(devices[i]);
  }

  //Сортируем массивы по мощности приборов
  devDArr.sort((a, b) => {
    if (a.power * a.duration < b.power * b.duration) {
      return 1;
    } else if (a.power * a.duration > b.power * b.duration) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  devNArr.sort((a, b) => {
    if (a.power * a.duration < b.power * b.duration) {
      return 1;
    } else if (a.power * a.duration > b.power * b.duration) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  devUArr.sort((a, b) => {
    if (a.power * a.duration < b.power * b.duration) {
      return 1;
    } else if (a.power * a.duration > b.power * b.duration) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  console.log('Устройства: ');
  console.log('Day: ',devDArr);
  console.log('Night: ',devNArr);
  console.log('Undefined: ',devUArr);
  
  let dArrLen = devDArr.length;
  let uArrLen = devUArr.length;
  
  //Создаем массив с используемой мощностью по часам
  let dPowArr = [];
  for (let i = 0; i < Object.keys(JsonDataOut.schedule).length; i++) {
    dPowArr[i] = 0;
  }
  
  let iterationsc = 0;
  
  //Раскидываем дневные приборы
  devDArr.forEach((item, idx) => {
    let devWorkH = item.duration;
    let devItemPow = item.power;
    let devItemId = item.id;
    let rates = ratesDArr;
    let ratesIdx = 0;
    let currRate;
    let timeAssigned = 0;
    let timePassed = 0;
    let searchIdx;
    
    console.log(item);

    let freeCells = 0;
    let cells = 0;
    dPowArr.forEach((item, idx) => {
      if (devItemPow <= maxPow - item && idx >= 7 && idx < 21) {
        freeCells++;
      } else {
        freeCells = 0;
      }

      if (freeCells > cells) {
        cells = freeCells;
      }
    });
    if (cells < devWorkH) {
      console.log(`Устройство: ${item.name}; id: ${devItemId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${cells}ч`);
      timeAssigned = 25;
    }
    console.log(cells, freeCells);
      
    while(devWorkH > timeAssigned) {

      iterationsc++;
      if (iterationsc > 1000) {
        timeAssigned = 25;
      }
      
      if (rates[ratesIdx]) {
        console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from', rates[ratesIdx].from, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      }
      
      if (devItemPow > maxPow) {

        console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
        break;

      } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
        
        console.log(timeAssigned, timePassed, rates[ratesIdx]);
        
        JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
        dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
        timeAssigned++;

      } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
        timePassed++;
      } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to && timeAssigned) {

        console.log('Смена тарифа..');
        devWorkH -= timeAssigned;
        timeAssigned = 0;
        timePassed = 0;
        searchIdx = 0;
        let currRate = rates[ratesIdx];
        
        console.log(currRate, ratesIdx);
        if (rates[ratesIdx + 1]) {
          while (rates[ratesIdx + searchIdx] && currRate.to !== rates[ratesIdx + searchIdx].from) {

            searchIdx++;
            console.log(searchIdx, rates[ratesIdx + searchIdx]);

            if (rates[ratesIdx + searchIdx] && currRate.to === rates[ratesIdx + searchIdx].from) {
              console.log('vetka1');
              ratesIdx += searchIdx;
              break;
            }
          }
        } else if (rates[ratesIdx - 1]) {
          console.log(rates[ratesIdx - searchIdx].to, currRate.to - item.duration + devWorkH);
          while (rates[ratesIdx - searchIdx] && rates[ratesIdx - searchIdx].to !== currRate.to - item.duration + devWorkH) {

            searchIdx++;
            console.log(searchIdx, ratesIdx);

            if (rates[ratesIdx - searchIdx] && rates[ratesIdx - searchIdx].to === currRate.to - item.duration + devWorkH) {
              console.log('vetka2');
              ratesIdx -= searchIdx;
              
              while (devWorkH > timeAssigned) {
                
                  if (dPowArr[rates[ratesIdx].to - 1 - timeAssigned] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {

                    console.log(timeAssigned, timePassed, rates[ratesIdx]);

                    JsonDataOut.schedule[rates[ratesIdx].to - 1 - timeAssigned].push(devItemId);
                    dPowArr[rates[ratesIdx].to - 1 - timeAssigned] += devItemPow;
                    timeAssigned++;
                }
              }
              
              break;
            }
          }
        }
        if (rates[ratesIdx]) {
          console.log(rates[ratesIdx], ratesIdx, 'perehod');
        } else {
          ratesIdx = 0;
          console.log(rates[ratesIdx], ratesIdx, 'obnulenie');
        }
      } else {
        
        if (rates[++ratesIdx]) {          
          console.log(rates[ratesIdx], ratesIdx, 'perehod');
        } else {
          ratesIdx = 0;
          console.log(rates[ratesIdx], ratesIdx, 'obnulenie');
        }
        devWorkH -= timeAssigned;
        timeAssigned = 0;
        timePassed = 0;
      }
    }
  });
  
  function searchEngineUN(rates, ratesIdx, searchDirection, endN) {
    console.log('searchin engine..');   
    let iterationsc = 0;
    let searchIdx = 0;
    let currRate = rates[ratesIdx];
    console.log(currRate);

    while (true) {

      iterationsc++;
      if (iterationsc > 1000) {
        timeAssigned = 25;
        console.log('Бесконечность!');
      }
      
      if (endN) {
        if (currRate.to === 7) {

          //Ищем fromStart
          while (true) {

            iterationsc++;
            if (iterationsc > 1000) {
              timeAssigned = 25;
              console.log('Бесконечность!');
            }

            searchIdx--;
            console.log('fromStart--', searchIdx);
            console.log('fromStart-- rates.from', rates[ratesIdx - searchIdx].from);

            if (rates[ratesIdx + searchIdx].to === currRate.from) {

              ratesIdx -= searchIdx;
              console.log('fromStart-- complete', rates[ratesIdx]);

              break;
            }
          }

          break;
        }
      }

      if (searchDirection) {

        searchIdx++;
        console.log('search++', searchIdx);
        
        if (rates[ratesIdx + searchIdx]) {
          
          console.log('search++ rates.from', rates[ratesIdx + searchIdx].from);
          
          if (rates[ratesIdx + searchIdx].from === currRate.to) {

            ratesIdx += searchIdx;
            console.log('search++ complete', rates[ratesIdx]);

            break;
          }
        } else {
          
          console.log('Changing search direction..');
          searchDirection = false;
        }

      } else if (!(searchDirection)) {

        searchIdx--;
        console.log('search--', searchIdx);
        console.log('search-- rates.to', rates[ratesIdx + searchIdx].from);

        if (rates[ratesIdx + searchIdx].from === currRate.to) {

          ratesIdx += searchIdx;
          console.log('search-- complete', rates[ratesIdx]);

          break;
        }
      } else {
        console.log('something went wrong!');
      } 

    }
    return ratesIdx;
  }
  
  
//Раскидываем ночные приборы
  devNArr.forEach((item, idx) => {
    let devWorkH = item.duration;
    let devItemPow = item.power;
    let devItemId = item.id;
    let rates = ratesNArr;
    let ratesIdx = 0;
    let timeAssigned = 0;
    let timePassed = 0;
    let zeroPass = false;
    let searchPlus = true;

    console.log(item);

    let freeCells = 0;
    let cells = 0;
    dPowArr.forEach((item, idx) => {
      if (devItemPow <= maxPow - item && (idx < 7 || idx >= 21)) {
        freeCells++;
      } else if (idx => 7 && idx < 21) {
        cells += freeCells;
        freeCells = 0;
      }
      if (idx === 23) {
        cells += freeCells;
      }
    });
    if (cells < devWorkH) {
      console.log(`Устройство: ${item.name}; id: ${devItemId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${cells}ч`);
      timeAssigned = 25;
    }
    console.log(cells, freeCells);

    while(devWorkH > timeAssigned) {

      iterationsc++;
      if (iterationsc > 1000) {
        timeAssigned = 25;
        console.log('Бесконечность!');
      }
      
      if (rates[ratesIdx]) {
        console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      }
      
      if (devItemPow > maxPow) {

        console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
        break;

      } 
      
      if (rates[ratesIdx].from < rates[ratesIdx].to) {
        
        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
          
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
          
          ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus, true);
          devWorkH -= timeAssigned;
          timeAssigned = 0;
          timePassed = 0;
        }
      } else {
        
        if (rates[ratesIdx].from + timeAssigned + timePassed < 24) {
          
          if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow) {
            
            console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
            dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
            timeAssigned++;

          } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
            timePassed++;
          } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
            
            ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus, true);
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
          }
          
        } else {
          
          if (!(zeroPass)) {
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
            zeroPass = true;
          }
          
          console.log('perehod cherez Zero!');
          
          if (rates[ratesIdx]) {
            console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'TA+TP', timeAssigned + timePassed);       
          }
          
          if (dPowArr[timeAssigned + timePassed] + devItemPow <= maxPow && timeAssigned + timePassed < rates[ratesIdx].to) {
            
            console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDataOut.schedule[timeAssigned + timePassed].push(devItemId);
            dPowArr[timeAssigned + timePassed] += devItemPow;
            timeAssigned++;

          } else if (dPowArr[timeAssigned + timePassed] + devItemPow > maxPow) {
            timePassed++;
          } else if (timeAssigned + timePassed >= rates[ratesIdx].to) {
            
            ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus, true);
            
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
          }
          
        }
        
      }

    }

  });
 
  //Раскидываем нейтральные приборы   
  devUArr.forEach((item, idx) => {
    let devWorkH = item.duration;
    let devItemPow = item.power;
    let devItemId = item.id;
    let rates = ratesUArr;
    let ratesIdx = 0;
    let timeAssigned = 0;
    let timePassed = 0;
    let zeroPass = false;
    let searchPlus = true;

    console.log(item);

    let freeCells = 0;
    let cells = 0;
    dPowArr.forEach((item) => {
      if (devItemPow <= maxPow - item) {
        freeCells++;
      } else {
        freeCells = 0;
      }

      if (freeCells > cells) {
        cells = freeCells;
      }
    });
    if (cells < devWorkH) {
      console.log(`Устройство: ${item.name}; id: ${devItemId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${cells}ч`);
      timeAssigned = 25;
    }
    console.log(cells, freeCells);
    
    while(devWorkH > timeAssigned) {

      iterationsc++;
      if (iterationsc > 1000) {
        timeAssigned = 25;
      }

      if (rates[ratesIdx]) {
        console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      }
      
      if (devItemPow > maxPow) {

        console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
        break;

      }
      
      if (rates[ratesIdx].from < rates[ratesIdx].to) {
        
        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
          
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
          
          if (item.duration === 24) {
            
            if (searchPlus && rates[ratesIdx + 1]) {
              ratesIdx++;
              console.log(rates[ratesIdx], 'perehod+');
            } else {
              searchPlus = false;
              ratesIdx--;
              console.log(rates[ratesIdx], 'perehod-')
            }
          } else {
            ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus);
          }
          
          devWorkH -= timeAssigned;
          timeAssigned = 0;
          timePassed = 0;
        }
      } else {
        
        if (rates[ratesIdx].from + timeAssigned + timePassed < 24) {
          
          if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow) {
            
            console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
            dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
            timeAssigned++;

          } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
            timePassed++;
          } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
            
          if (item.duration === 24) {
            
            if (searchPlus && rates[ratesIdx + 1]) {
              ratesIdx++;
              console.log(rates[ratesIdx], 'perehod+');
            } else {
              searchPlus = false;
              ratesIdx--;
              console.log(rates[ratesIdx], 'perehod-')
            }
          } else {
            ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus);
          }
          
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
          }
          
        } else {
          
          if (!(zeroPass)) {
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
            zeroPass = true;
          }
          
          console.log('perehod cherez Zero!');
          
          if (rates[ratesIdx]) {
            console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'TA+TP', timeAssigned + timePassed);       
          }
          
          if (dPowArr[timeAssigned + timePassed] + devItemPow <= maxPow && timeAssigned + timePassed < rates[ratesIdx].to) {
            
            console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDataOut.schedule[timeAssigned + timePassed].push(devItemId);
            dPowArr[timeAssigned + timePassed] += devItemPow;
            timeAssigned++;

          } else if (dPowArr[timeAssigned + timePassed] + devItemPow > maxPow) {
            timePassed++;
          } else if (timeAssigned + timePassed >= rates[ratesIdx].to) {
          
            if (item.duration === 24) {

              if (searchPlus && rates[ratesIdx + 1]) {
                ratesIdx++;
                console.log(rates[ratesIdx], 'perehod+');
              } else {
                searchPlus = false;
                ratesIdx--;
                console.log(rates[ratesIdx], 'perehod-')
              }
            } else {
              ratesIdx = searchEngineUN(rates, ratesIdx, searchPlus);
            }

            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
          }
          
        }
        
      }

    }

  });
  
  console.log(JsonDataOut.schedule, dPowArr);
  console.log(rates);
  return JsonDataOut;
}

window.onload = function() {
  console.log('window loaded!');
  
  var JsonOut = smartHouse(JsonInp);
  
  console.log(JsonOut);
};