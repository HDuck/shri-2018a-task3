let JsonInp = `{
  "devices": [
      {
          "id": "F972B82BA56A70CC579945773B6866FB",
          "name": "Посудомоечная машина",
          "power": 950,
          "duration": 10,
          "mode": "night"
      },
      {
          "id": "C515D887EDBBE669B2FDAC62F571E9E9",
          "name": "Духовка",
          "power": 2000,
          "duration": 12,
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
          "duration": 10
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
          "from": 21,
          "to": 23,
          "value": 5.38
      },
      {
          "from": 23,
          "to": 7,
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
  ratesDArr.sort(function(a, b) {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  ratesNArr.sort(function(a, b) {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  ratesUArr.sort(function(a, b) {
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
  devDArr.sort(function(a, b) {
    if (a.duration < b.duration) {
      return 1;
    } else if (a.duration > b.duration) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  devNArr.sort(function(a, b) {
    if (a.duration < b.duration) {
      return 1;
    } else if (a.duration > b.duration) {
      return -1;
    } else {
      return 0;
    }    
  });
  
  devUArr.sort(function(a, b) {
    if (a.duration < b.duration) {
      return 1;
    } else if (a.duration > b.duration) {
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
    let searchIdx = 1;
    
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
      console.log('Недостаточно свободного времени!');
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
        if (rates[ratesIdx + 1] && rates[ratesIdx + 1].to <= 21) {
          while (currRate.to !== rates[ratesIdx + searchIdx].from) {

            searchIdx++;
            console.log(searchIdx);

            if (currRate.to === rates[ratesIdx + searchIdx].from) {
              console.log('vetka1');
              ratesIdx += searchIdx;
              break;
            }
          }
        } else {
          console.log(rates[ratesIdx - searchIdx].to, currRate.to - item.duration + devWorkH);
          while (rates[ratesIdx - searchIdx].to !== currRate.to - item.duration + devWorkH) {

            searchIdx++;
            console.log(searchIdx, ratesIdx);

            if (rates[ratesIdx - searchIdx].to === currRate.to - item.duration + devWorkH) {
              console.log('vetka2');
              ratesIdx -= searchIdx;
              
              while (devWorkH > timeAssigned) {
                  if (devItemPow > maxPow) {

                    console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
                    break;

                  } else if (dPowArr[rates[ratesIdx].to - 1 - timeAssigned] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {

                    console.log(timeAssigned, timePassed, rates[ratesIdx]);

                    JsonDataOut.schedule[rates[ratesIdx].to - 1 + timeAssigned].push(devItemId);
                    dPowArr[rates[ratesIdx].to - 1 + timeAssigned] += devItemPow;
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
        
        /*if (rates[ratesIdx].to - rates[ratesIdx].from - timePassed < devWorkH && dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow) {

          currRate = rates[ratesIdx];
          console.log(rates[ratesIdx], ratesIdx);
          if (rates[ratesIdx + searchIdx] && rates[ratesIdx + searchIdx].value >= currRate.value) {

            searchIdx = 0;

            while (currRate.to !== rates[ratesIdx + searchIdx].from) {

              searchIdx++;

              if (!(rates[ratesIdx + searchIdx])) {
                console.log('ошибка');
                break;
              }
              console.log(searchIdx);

            }
            console.log(currRate.to !== rates[ratesIdx + searchIdx].from);


            let contRatesIdx = ratesIdx + searchIdx;
            console.log('vetka1', rates[contRatesIdx]);
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;

            while (devWorkH > timeAssigned) {

              iterationsc++;
              if (iterationsc > 1000) {
                timeAssigned = 25;
              }

              console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[contRatesIdx]from+TA+TP', rates[contRatesIdx].from + timeAssigned + timePassed);

              if (dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[contRatesIdx].from + timeAssigned + timePassed < rates[contRatesIdx].to) {
                console.log(timeAssigned, timePassed, rates[contRatesIdx]);

                JsonDataOut.schedule[rates[contRatesIdx].from + timeAssigned + timePassed].push(devItemId);
                dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] += devItemPow;
                timeAssigned++;

              } else if (dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
                timePassed++;
              } else if (rates[contRatesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
                console.log(contRatesIdx, 'perehod');
                ratesIdx = contRatesIdx;
                devWorkH -= timeAssigned;
                timeAssigned = 0;
                timePassed = 0;
                break;
              }
            }

          } else if (rates[ratesIdx - searchIdx] && rates[ratesIdx - searchIdx].value >= currRate.value) {

            searchIdx = 0;
            currRate = rates[ratesIdx];
            console.log(currRate, rates);

            while (currRate.to !== rates[ratesIdx - searchIdx].from) {

              if (!(rates[ratesIdx - searchIdx])) {
                console.log('ошибка');
                break;
              }

              searchIdx--;
            }

            let contRatesIdx = ratesIdx - searchIdx;
            console.log('vetka2');

            while (devWorkH > timeAssigned) {

              iterationsc++;
              if (iterationsc > 1000) {
                timeAssigned = 25;
              }

              console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[contRatesIdx]from+TA+TP', rates[contRatesIdx].from + timeAssigned + timePassed);

              if (dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[contRatesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
                console.log(timeAssigned, timePassed, rates[contRatesIdx]);

                JsonDataOut.schedule[rates[contRatesIdx].from + timeAssigned + timePassed].push(devItemId);
                dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] += devItemPow;
                timeAssigned++;

              } else if (dPowArr[rates[contRatesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
                timePassed++;
              } else if (rates[contRatesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
                ratesIdx = contRatesIdx;
                console.log(contRatesIdx, 'perehod');
                devWorkH -= timeAssigned;
                timeAssigned = 0;
                timePassed = 0;
                break;
              }
            }
          }
        }*/
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
  
//Раскидываем ночные приборы
  devNArr.forEach((item, idx) => {
    let devWorkH = item.duration;
    let devItemPow = item.power;
    let devItemId = item.id;
    let rates = ratesNArr;
    let ratesIdx = 0;
    let timeAssigned = 0;
    let timePassed = 0;

    console.log(item);

    let freeCells = 0;
    let cells = 0;
    dPowArr.forEach((item, idx) => {
      if (devItemPow <= maxPow - item && idx < 7 || idx >= 21) {
        freeCells++;
      } else if (idx < 7 || idx >= 21) {
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

      console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);

      if (devItemPow > maxPow) {

        console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
        break;

      } else if (rates[ratesIdx].from < rates[ratesIdx].to) {

        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
          
          if (!(rates[++ratesIdx])) {
            console.log('Ошибка!');
            break;
          } else {
            console.log(ratesIdx, 'perehod');
            devWorkH -= timeAssigned;
            timeAssigned = 0;
            timePassed = 0;
          }
          

        }

      } else if (rates[ratesIdx].from > rates[ratesIdx].to) {

        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow) {
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed === 24 && rates[ratesIdx].from > rates[ratesIdx].to) {
          console.log('eureka!', devWorkH, timeAssigned);
          while(devWorkH > timeAssigned) {


            iterationsc++;
            if (iterationsc > 1000) {
              timeAssigned = 25;
            }
            console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);

            if (dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from - 24 + timeAssigned + timePassed < rates[ratesIdx].to) {
              console.log(timeAssigned, timePassed, rates[ratesIdx]);

              JsonDataOut.schedule[rates[ratesIdx].from - 24 + timeAssigned + timePassed].push(devItemId);
              dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] += devItemPow;
              timeAssigned++;

            } else if (dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] + devItemPow > maxPow) {
              timePassed++;
            } else if (rates[ratesIdx].from + timeAssigned + timePassed > rates[ratesIdx].to) {

              if (!(rates[++ratesIdx])) {
                console.log('ошибка');
                break;
              } else {
                console.log(ratesIdx, 'perehod');
                devWorkH -= timeAssigned;
                timeAssigned = 0;
                timePassed = 0;
                break;
              }
            }
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

      console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);

      if (devItemPow > maxPow) {

        console.log(`Устройство: ${item.name}; id: ${devItemId};\nПревышена разрешенная мощность: ${devItemPow} > ${maxPow}`);
        break;

      } else if (rates[ratesIdx].from < rates[ratesIdx].to) {

        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {
          ratesIdx++;
          console.log(ratesIdx, 'perehod');
          if (!(rates[ratesIdx])) {
            console.log('ошибка');
            break;
          }
          devWorkH -= timeAssigned;
          timeAssigned = 0;
          timePassed = 0;
        }

      } else if (rates[ratesIdx].from > rates[ratesIdx].to) {

        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow <= maxPow) {
          console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDataOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devItemId);
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devItemPow;
          timeAssigned++;

        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devItemPow > maxPow) {
          timePassed++;
        } else if (rates[ratesIdx].from + timeAssigned + timePassed === 24 && rates[ratesIdx].from > rates[ratesIdx].to) {
          console.log('eureka!', devWorkH, timeAssigned);
          while(devWorkH > timeAssigned) {


            iterationsc++;
            if (iterationsc > 1000) {
              timeAssigned = 25;
            }
            console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);

            if (dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] + devItemPow <= maxPow && rates[ratesIdx].from - 24 + timeAssigned + timePassed < rates[ratesIdx].to) {
              console.log(timeAssigned, timePassed, rates[ratesIdx]);

              JsonDataOut.schedule[rates[ratesIdx].from - 24 + timeAssigned + timePassed].push(devItemId);
              dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] += devItemPow;
              timeAssigned++;

            } else if (dPowArr[rates[ratesIdx].from - 24 + timeAssigned + timePassed] + devItemPow > maxPow) {
              timePassed++;
            } else if (rates[ratesIdx].from + timeAssigned + timePassed > rates[ratesIdx].to) {
              ratesIdx++;
              console.log(ratesIdx, 'perehod');
              if (!(rates[ratesIdx])) {
                console.log('ошибка');
                break;
              }
              devWorkH -= timeAssigned;
              timeAssigned = 0;
              timePassed = 0;
              break;
            }
          }
        }

      }
    }

  });
  
  console.log(JsonDataOut.schedule, dPowArr);
  return JsonDataOut;
}

window.onload = function() {
  console.log('window loaded!');
  
  smartHouse(JsonInp);
};