function smartHouse(JsonDataIn) {
  
  //Создаем макет выходных данных
  let JsonDummyOut = {
    
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
  
  //Преобразуем входной JSON в JS объект
  let inp = JSON.parse(JsonDataIn);
  
  let rates = inp.rates;      //Исходные тарифы
  let devices = inp.devices;  //Исходные устройства
  let maxPow = inp.maxPower;  //Исходный максимум мощности в час
  
  let ratesDArr = [];         //Массив с дневными тарифами
  let ratesNArr = [];         //Массив с ночными тарифами
  let ratesUArr = rates;      //Массив с общими тарифами

  //Перебираем все тарифы
  for (let i = 0; i < rates.length; i++) {

    let start = rates[i].from;

    //Ночь 0 с 7
    if (start >= 0 && start < 7) {

      ratesNArr.push(rates[i]);  //Заполняем массив ночных тарифов
    }

    //День с 7 до 21
    if (start >= 7 && start < 21) {

      ratesDArr.push(rates[i]);  //Заполняем массив дневных тарифов
    }

    //Ночь с 21 до 23
    if (start >= 21 && start < 24) {

      ratesNArr.push(rates[i]);  //Заполняем массив ночных тарифов
    }
  }

  //Сортируем массивы по стоимости тарифов
  ratesDArr.sort((a, b) => {
    
    if (a.value > b.value)
      return 1;
    
    else if (a.value < b.value)
      return -1;
    
    else
      return 0;

  });
  
  ratesNArr.sort((a, b) => {
    
    if (a.value > b.value)
      return 1;
    
    else if (a.value < b.value)
      return -1;
    
    else
      return 0;
    
  });
  
  ratesUArr.sort((a, b) => {
    
    if (a.value > b.value)
      return 1;
    
    else if (a.value < b.value)
      return -1;
    
    else
      return 0;
    
  });
  
  //Показываем в консоли отсортированные тарифы
//  console.log('Тарифы: ');
//  console.log('ratesDArr: ', ratesDArr);
//  console.log('ratesNArr: ', ratesNArr);
//  console.log('ratesUArr: ', ratesUArr);
  
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

  //Сортируем массивы по мощности и длительности работы устройств
  devDArr.sort((a, b) => {
    
    if (a.power * a.duration < b.power * b.duration)
      return 1;
    
    else if (a.power * a.duration > b.power * b.duration)
      return -1;
    
    else
      return 0;
    
  });
  
  devNArr.sort((a, b) => {
    
    if (a.power * a.duration < b.power * b.duration)
      return 1;
    
    else if (a.power * a.duration > b.power * b.duration)
      return -1;
    
    else
      return 0;
    
  });
  
  devUArr.sort((a, b) => {
    
    if (a.power * a.duration < b.power * b.duration)
      return 1;
    
    else if (a.power * a.duration > b.power * b.duration)
      return -1;
    
    else
      return 0;
    
  });
  
  //Показываем в консоли отсортированные устройства
//  console.log('Устройства: ');
//  console.log('Day: ',devDArr);
//  console.log('Night: ',devNArr);
//  console.log('Undefined: ',devUArr);

  //Создаем массив с используемой мощностью по часам
  let dPowArr = [];
  
  //Создаем структуру, соответствующуй расписанию выходного макета и заполняем нулями
  for (let i = 0; i < Object.keys(JsonDummyOut.schedule).length; i++) {
    dPowArr[i] = 0;
  }
  
  //Функция поиска
  function searchEngine(ratesArr, currRatesIdx, device, undBool) {
    
    let searchIdx = 0;                      //Поисковой индекс
    let currRate = ratesArr[currRatesIdx];  //Текущий тариф
    let idxOne = null;                      //Первый найденный индекс
    let idxTwo = null;                      //Второй найденный индекс
    let valOne = null;                      //Значение первого найденного тарифа
    let valTwo = null;                      //Значение второго найденного тарифа
    let rateTo = null;                      //Искомые конец/начало дня
    let iterations = 0;                     //Для защиты от зацикливания при непредвиденных ситуациях
    let devItem = device;
    let matchFoundRight = false;
    let matchFoundLeft = false;
    
    //console.log('Searching engine activated!'); 
    //console.log(currRate);
    
    while (true) {

      //Заглушка от бесконечного цикла
      iterations++;
      if (iterations > 1000) {
        console.log('>>>Бесконечность!<<<');
        break;
      }
      
      //Выбираем метод поиска в зависимости от того, какой текущий тариф (приграничный к концу/началу дня/ночи)
      if (!(undBool) && (currRate.from === 7 || currRate.from === 21 || currRate.to === 7 || currRate.to === 21)) {
        
        //В начале дня/ночи
        if (currRate.from === 7 || currRate.from === 21) {
          
          //console.log('endPointS++');
          //console.log('endPointS++ rates.to', ratesArr[currRatesIdx + searchIdx].to);

          //Определяем конец дня/ночи
          if (currRate.from === 7)
            rateTo = 21;
          
          else if (currRate.from === 21)
            rateTo = 7;
         
          //Ищем тариф который соответствует концу дня/ночи
          if (ratesArr[searchIdx].to === rateTo) {
            
            //console.log('endPointS++ complete', currRatesIdx);
            
            //Возвращаем индекс найденного тарифа
            return searchIdx;
          }
          
          searchIdx++; //Повышаем поисковой индекс, пока нет совпадений
        
        //В конце дня/ночи
        } else if (currRate.to === 7 || currRate.to === 21) {
          
          //console.log('endPointS--');
          //console.log('endPointS-- rates.from', ratesArr[currRatesIdx + searchIdx].to);

          //Определяем начало дня/ночи
          if (currRate.to === 7)
            rateTo = 21;
          
          else if (currRate.to === 21)
            rateTo = 7;

          //Ищем тариф, которые соответсвует началу дня/ночи
          if (ratesArr[searchIdx].from === rateTo) {
            
            //console.log('endPointS-- complete', currRatesIdx);

            //Возвращаем индекс найденного тарифа
            return searchIdx;
          }
          
          searchIdx++; //Повышаем поисковой индекс, пока нет совпадений
        }
      
      //Случай если не пограничные условия
      } else {
 
        //console.log('search++', searchIdx);

        //Ищем тариф, который начинается там, где закончился текущий тариф
        if (ratesArr[searchIdx].from === currRate.to) {
          
          //Проверяем найденный тариф на наличие записей о текущем устройстве
          for (let key in JsonDummyOut.schedule) {
            
            if (key == ratesArr[searchIdx].from) {  //Находим совпадение времени в рассписании со временем начала следующего тарифа
              
              if (ratesArr[searchIdx].to > ratesArr[searchIdx].from) {  //Случай без перехода через 0
                
                for (let i = 0; i < ratesArr[searchIdx].to - ratesArr[searchIdx].from; i++) {  //Перебираем все имена в расписании на час указанный в тарифе
                  
                  JsonDummyOut.schedule[parseInt(key) + i].forEach((item) => {  //Перебираем все имена в данный час тарифа

                    if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                      matchFoundRight = true;  //Записываем совпадение с именем текущего устройства
                    }
                  });
          
                  if (matchFoundRight) {  //Если есть совпадение - прерываем перебор имен
                    
                    break;
                  }
                }
                
              } else if (ratesArr[searchIdx].to < ratesArr[searchIdx].from) {  //Случай с переходом через 0
                
                for (let i = 0; i < ratesArr[searchIdx].to - ratesArr[searchIdx].from + 24; i++) {  //Перебираем все имена в расписании на час указанный в тарифе
                  
                  if (parseInt(key) + i < 24) {  //Случай до перехода через 0
                    
                    JsonDummyOut.schedule[parseInt(key) + i].forEach((item) => {  //Перебираем все имена в данный час тарифа
                    
                      if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                        matchFoundRight = true;  //Записываем совпадение с именем текущего устройства
                      }
                    });
                    
                  } else if (parseInt(key) + i  >= 24) {  //Случай после перехода через 0
                    
                    JsonDummyOut.schedule[parseInt(key) + i - 24].forEach((item) => {  //Перебираем все имена в данный час тарифа
                    
                      if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                        matchFoundRight = true;  //Записываем совпадение с именем текущего устройства
                      }
                    });
                  }
                 
                  if (matchFoundRight) {  //Если есть совпадение - прерываем перебор имен
                    break;
                  }
                }
              }
            }
          }
          
          //Запоминаем индекс и значение мощности, найденного тарифа
          idxOne = searchIdx;
          valOne = ratesArr[searchIdx].value;
          
          //console.log('search++ complete', idxOne, valOne);
          //console.log('initializing search++ deep');
          
          searchIdx = 0;  //Обнуляем индекс поиска

          //Инициализируем поиск другого соседнего тарифа
          while(true) {
            
            //Заглушка от бесконечного цикла
            iterations++;
            if (iterations > 1000) {
              console.log('>>>Бесконечность!<<<');
              break;
            }

            //console.log('search++ deep', searchIdx);

            //Ищем тариф, который заканчивается там, где начался текущий тариф
            if (ratesArr[searchIdx].to === currRate.from) {

              //Проверяем найденный тариф на наличие записей о текущем устройстве
              for (let key in JsonDummyOut.schedule) {
            
                if (key == ratesArr[searchIdx].to) {  //Находим совпадение времени в рассписании со временем конца следующего тарифа

                  if (ratesArr[searchIdx].to > ratesArr[searchIdx].from) {  //Случай без перехода через 0

                    for (let i = 0; i < ratesArr[searchIdx].to - ratesArr[searchIdx].from; i++) {  //Перебираем все имена в расписании на час указанный в тарифе
                      
                        JsonDummyOut.schedule[parseInt(key) - i].forEach((item) => {  //Перебираем все имена в данный час тарифа

                          if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                            matchFoundLeft = true;  //Записываем совпадение с именем текущего устройства
                          }
                        });
                      
                      if (matchFoundLeft) {  //Если есть совпадение - прерываем перебор имен
                        break;
                      }
                    }

                  } else if (ratesArr[searchIdx].to < ratesArr[searchIdx].from) {  //Случай с переходом через 0

                    for (let i = 0; i < ratesArr[searchIdx].to - ratesArr[searchIdx].from + 24; i++) {  //Перебираем все имена в расписании на час указанный в тарифе

                      if (parseInt(key) - i >= 0) {  //Случай до перехода через 0

                        JsonDummyOut.schedule[parseInt(key) - i].forEach((item) => {  //Перебираем все имена в данный час тарифа

                          if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                            matchFoundLeft = true;  //Записываем совпадение с именем текущего устройства
                          }
                        });

                      } else if (parseInt(key) - i  < 0) {  //Случай после перехода через 0

                        JsonDummyOut.schedule[parseInt(key) - i + 24].forEach((item) => {

                          if (item == devItem.id) {  //Проверяем имена на совпадение с именем текущего устройства

                            matchFoundLeft = true;  //Записываем совпадение с именем текущего устройства
                          }
                        });
                      }
                      
                      if (matchFoundLeft) {  //Если есть совпадение - прерываем перебор имен
                        break;
                      }
                    }
                  }
                }
              }
              
              //Запоминаем индекс и значение мощности, найденного тарифа
              idxTwo = searchIdx;
              valTwo = ratesArr[searchIdx].value;
              
              //console.log('search++ deep complete', idxTwo, valTwo);
              
              //Обрабатываем совпадения
              //Если нет совпадений с обеих сторон, то выбираем тариф по наименьшей мощности
              if (!(matchFoundLeft) && !(matchFoundRight)) {
                
                //Сравниваем соседние тарифы и ищем более выгодный
                if (valOne > valTwo)
                  return idxTwo;  //Возвращаем индекс тарифа, который "левее" текущего

                else if (valOne < valTwo)
                  return idxOne;  //Возвращаем индекс тарифа, который "правее" текущего

                else {

                  //Добавляем псевдо-рандома, если тарифы одинаковые
                  if (Math.random() > 0.5)
                    return idxOne;

                  else
                    return idxTwo;

                }
                
              } else if (matchFoundLeft && matchFoundRight) {             //Если есть совпадения с обоих сторон, то выбираем правый тариф и начинаем искать относительно его
                
                return searchEngine(ratesArr, idxOne, devItem, undBool);  //idxOne соответсвует тарифу идущему после текущего по времени
                
              } else if (matchFoundLeft) {   //При наличии совпадения слева - выбираем правый тариф
                
                return idxOne;               //idxOne соответсвует тарифу идущему после текущего по времени
                
              } else if (matchFoundRight) {  //При наличии совпадения справа - выбираем левый тариф
                
                return idxTwo;               //idxTwo соответсвует тарифу идущему перед текущим по времени
              }
              
              break;  //Прерываем текущий цикл
            }
            
            searchIdx++;  //Повышаем поисковой индекс, пока нет совпадений
          }         
        }
        
        searchIdx++;  //Повышаем поисковой индекс, пока нет совпадений
      }      
    }

    return false;  //Возвращаем false при неудавшемся поиске
  }
  
  //Функция расчета стоимости потребленной энергии
  function rateCalc(devItem, ratesValue) {
    
    let devId = devItem.id;       //Идентефикатор устройства
    let devPow = devItem.power;   //Мощность устройства
    let rateVal = ratesValue;     //Значение текущего тарифа
    let result = false;           //Наличие устройства в списке для расчета потребляемой энергии
    
    //Проверяем наличие устройства в списке
    for (let key in JsonDummyOut.consumedEnergy.devices) {
      
      if (key === devId)
        result = true;

    }
    
    //Добавляем устройство в список если отсутствует
    if (!(result))
      JsonDummyOut.consumedEnergy.devices[devId] = 0;

    let energyUsed = (devPow / 1000) * rateVal;  //Расчитываем затраты по тарифу за прошедший час
    
    JsonDummyOut.consumedEnergy.devices[devId] += energyUsed;  //Добавляем затраты к соответсвующему устройству
    JsonDummyOut.consumedEnergy.value += energyUsed;           //Добавляем затраты в общий кошелек
  }
  
  //Раскидываем дневные приборы
  devDArr.forEach((item, idx) => {
    
    let devId = item.id;            //Идентификатор текущего устройства
    let devPow = item.power;        //Мощность текущего устройства
    let devWorkH = item.duration;   //Длительность работы текущего устройства
    let rates = ratesDArr;          //Массив с дневными тарифами
    let ratesIdx = 0;               //Начальный индекс массива (самый дешевый тариф)
    let timeAssigned = 0;           //Количество вписаных часов в расписание
    let timePassed = 0;             //Количество пропущенных часов из-за заполненности расписания
    let searchIterations = 0;       //Количество циклов поиска searchEngine
    let searchPlus = true;          //Показатель направления грубого поиска при зацикливании searchEngine 
    let iterations = 0;             //Для защиты от зацикливания при непредвиденных ситуациях
    
    //console.log(item);

    let freeCells = 0;  //Свободные ячейки времени
    let maxCells = 0;   //Максимально свободный неразрывный промежуток времени
    
    //Расчет максимально свободного промежутка времени
    dPowArr.forEach((item, idx) => {
      
      //Подсчитываем свободные ячейки времени
      devPow <= maxPow - item && idx >= 7 && idx < 21 ? freeCells++ : freeCells = 0;

      //Записываем если свободно больше текущего максимума
      if (freeCells > maxCells)
        maxCells = freeCells;
     
    });
    
    //Выводим в консоль сообщение о невозможности добавления данного устройства в расписание 
    if (devPow > maxPow) {

      console.log(`Устройство: ${item.name}; id: ${devId};\nПревышена разрешенная мощность: ${devPow} > ${maxPow}`);
      timeAssigned = 25;  //Предотвращаем вход в цикл

    } else if (maxCells < devWorkH) {
      
      console.log(`Устройство: ${item.name}; id: ${devId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${maxCells}ч`);
      timeAssigned = 25;  //Предотвращаем вход в цикл
    }

    //Распределяем устройство по расписанию
    while(devWorkH > timeAssigned) {

      //Заглушка от бесконечного цикла
      iterations++;
      if (iterations > 1000) {
        console.log(`Устройство: ${item.name}; id: ${devId};\nНепредвиденная ошибка! Бесконечность!`);
        break;
      }

      //Отладочная информация
      //if (rates[ratesIdx]) {
      //  console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      //}

      //Проверка возможности добавления устройства в текущий час расписания при наличии
      //достаточной нераспределенной мощности и не превышении границ времени текущего тарифа
      if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {

        //console.log(timeAssigned, timePassed, rates[ratesIdx]);

        JsonDummyOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
        dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей
        
        rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
        timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства
      
      //Если в текущий час нет свободной мощности
      } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow > maxPow) {
        
        timePassed++;  //Повышаем кол-во пропущенных часов
      
      //Если текущий час на границе двух тарифов
      } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {

        //Проверка на необходимость грубого поиска
        if (searchIterations > 14) {

          //Проверка на наличие следующего тарифа в массиве дневных тарифов
          if (searchPlus && rates[ratesIdx + 1]) {
            
            ratesIdx++;  //Повышаем индекс массива
            
          } else {
            
            searchPlus = false;  //Отключаем возможность повышать индекс массива
            ratesIdx--;          //Понижаем индекс массива
          }
          
        } else {
          
          ratesIdx = searchEngine(rates, ratesIdx, item);  //Инициализируем поиск тарифа
          searchIterations++;                        //Повышаем количество циклов поиска
          
        }
        
        devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
        timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
        timePassed = 0;            //Обнуляем кол-во пропущенных часов
      }
    }
  });

  //Раскидываем ночные приборы
  devNArr.forEach((item, idx) => {
    
    let devId = item.id;            //Идентификатор текущего устройства
    let devPow = item.power;        //Мощность текущего устройства
    let devWorkH = item.duration;   //Длительность работы текущего устройства
    let rates = ratesNArr;          //Массив с ночными тарифами
    let ratesIdx = 0;               //Начальный индекс массива (самый дешевый тариф)
    let timeAssigned = 0;           //Количество вписаных часов в расписание
    let timePassed = 0;             //Количество пропущенных часов из-за заполненности расписания
    let zeroPass = false;           //Показатель перехода через 0
    let searchIterations = 0;       //Количество циклов поиска searchEngine
    let searchPlus = true;          //Показатель направления грубого поиска при зацикливании searchEngine 
    let iterations = 0;             //Для защиты от зацикливания при непредвиденных ситуациях

    //console.log(item);

    let freeCells = 0;    //Свободные ячейки времени
    let maxCells = 0;     //Максимально свободный неразрывный промежуток времени
    let addCells = 0;     //Свободные ячейки от 0 до первой несвободной ячейку
    let fromZero = true;  //Индикатор попадания на первую несвободную ячейку
    
    //Расчет максимально свободного промежутка времени
    dPowArr.forEach((item, idx) => {
      
      //Подсчитываем свободные ячейки времени
      devPow <= maxPow - item && (idx < 7 || idx >= 21) ? freeCells++ : freeCells = 0;
      
      //Подсчитываем свободные ячейки от 0 до первой несвободной или до 7
      fromZero && devPow <= maxPow - item && idx < 7 ? addCells++ : fromZero = false;
      
      //Добавляем свободные ячейки от нуля к ячейкам в конце если на 23 часа существуют свободные ячейки
      if (idx === 23 && freeCells !== 0)
        freeCells += addCells;
      
      //Записываем если свободно больше текущего максимума
      if (maxCells < freeCells)
        maxCells = freeCells;
  
    });
    
    //Выводим в консоль сообщение о невозможности добавления данного устройства в расписание 
    if (devPow > maxPow) {

      console.log(`Устройство: ${item.name}; id: ${devId};\nПревышена разрешенная мощность: ${devPow} > ${maxPow}`);
      timeAssigned = 25;  //Предотвращаем вход в цикл

    } else if (maxCells < devWorkH) {
      
      console.log(`Устройство: ${item.name}; id: ${devId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${maxCells}ч`);
      timeAssigned = 25;  //Предотвращаем вход в цикл
    }

    //Распределяем устройство по расписанию
    while(devWorkH > timeAssigned) {

      //Заглушка от бесконечного цикла
      iterations++;
      if (iterations > 1000) {
        console.log(`Устройство: ${item.name}; id: ${devId};\nНепредвиденная ошибка! Бесконечность!`);
        break;
      }
      
      //Отладочная информация
      //if (rates[ratesIdx]) {
      //  console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      //}
      
      //Проверка на переходный с суток на сутки тариф
      if (rates[ratesIdx].from < rates[ratesIdx].to) {
        
        //Проверка возможности добавления устройства в текущий час расписания при наличии
        //достаточной нераспределенной мощности и не превышении границ времени текущего тарифа
        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {

          //console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDummyOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

          rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
          timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

        //Если в текущий час нет свободной мощности
        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow > maxPow) {

          timePassed++;  //Повышаем кол-во пропущенных часов

        //Если текущий час на границе двух тарифов
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {

          //Проверка на необходимость грубого поиска
          if (searchIterations > 14) {

            //Проверка на наличие следующего тарифа в массиве дневных тарифов
            if (searchPlus && rates[ratesIdx + 1]) {

              ratesIdx++;  //Повышаем индекс массива

            } else {

              searchPlus = false;  //Отключаем возможность повышать индекс массива
              ratesIdx--;          //Понижаем индекс массива
            }

          } else {

            ratesIdx = searchEngine(rates, ratesIdx, item);  //Инициализируем поиск тарифа
            searchIterations++;                        //Повышаем количество циклов поиска

          }

          devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
          timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
          timePassed = 0;            //Обнуляем кол-во пропущенных часов
        }
        
      } else if (rates[ratesIdx].from > rates[ratesIdx].to) {
        
        //Проверка на 24 часа
        if (rates[ratesIdx].from + timeAssigned + timePassed < 24) {
          
          //Проверка возможности добавления устройства в текущий час расписания при наличии
          //достаточной нераспределенной мощности и перехода через 0
          if (!(zeroPass) && dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow <= maxPow) {

            //console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDummyOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
            dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

            rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
            timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

          //Если в текущий час нет свободной мощности
          } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow > maxPow) {

            timePassed++;  //Повышаем кол-во пропущенных часов

          //Если текущий час на границе двух тарифов
          } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {

            //Проверка на необходимость грубого поиска
            if (searchIterations > 14) {

              //Проверка на наличие следующего тарифа в массиве дневных тарифов
              if (searchPlus && rates[ratesIdx + 1]) {

                ratesIdx++;  //Повышаем индекс массива

              } else {

                searchPlus = false;  //Отключаем возможность повышать индекс массива
                ratesIdx--;          //Понижаем индекс массива
              }

            } else {

              ratesIdx = searchEngine(rates, ratesIdx, item);  //Инициализируем поиск тарифа
              searchIterations++;                        //Повышаем количество циклов поиска

            }

            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
          }
          
        } else {
          
          //Проверка на переход через 0
          if (!(zeroPass)) {
            
            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
            zeroPass = true;           //Изменяем показатель перехода
            
          }
          
          //Отладочная информация
          //console.log('Zdes bil Zero!', zeroPass);
          //if (rates[ratesIdx]) {
          //  console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'TA+TP', timeAssigned + timePassed);       
          //}
          
          //Проверка возможности добавления устройства в текущий час расписания при наличии
          //достаточной нераспределенной мощности и не превышении границ времени текущего тарифа
          if (dPowArr[timeAssigned + timePassed] + devPow <= maxPow && timeAssigned + timePassed < rates[ratesIdx].to) {

            //console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDummyOut.schedule[timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
            dPowArr[timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

            rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
            timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

          //Если в текущий час нет свободной мощности
          } else if (dPowArr[timeAssigned + timePassed] + devPow > maxPow) {

            timePassed++;  //Повышаем кол-во пропущенных часов

          //Если текущий час на границе двух тарифов
          } else if (timeAssigned + timePassed >= rates[ratesIdx].to) {

            //Проверка на необходимость грубого поиска
            if (searchIterations > 14) {

              //Проверка на наличие следующего тарифа в массиве дневных тарифов
              if (searchPlus && rates[ratesIdx + 1]) {

                ratesIdx++;  //Повышаем индекс массива

              } else {

                searchPlus = false;  //Отключаем возможность повышать индекс массива
                ratesIdx--;          //Понижаем индекс массива
              }

            } else {

              ratesIdx = searchEngine(rates, ratesIdx, item);  //Инициализируем поиск тарифа
              searchIterations++;                        //Повышаем количество циклов поиска

            }

            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
          }
        }
      }
    }
  });
 
  //Раскидываем нейтральные приборы   
  devUArr.forEach((item, idx) => {
 
    let devId = item.id;            //Идентификатор текущего устройства
    let devPow = item.power;        //Мощность текущего устройства
    let devWorkH = item.duration;   //Длительность работы текущего устройства
    let rates = ratesUArr;          //Массив с общими тарифами
    let ratesIdx = 0;               //Начальный индекс массива (самый дешевый тариф)
    let timeAssigned = 0;           //Количество вписаных часов в расписание
    let timePassed = 0;             //Количество пропущенных часов из-за заполненности расписания
    let zeroPass = false;           //Показатель перехода через 0
    let searchIterations = 0;       //Количество циклов поиска searchEngine
    let searchPlus = true;          //Показатель направления грубого поиска при зацикливании searchEngine 
    let iterations = 0;             //Для защиты от зацикливания при непредвиденных ситуациях

    //console.log(item);

    let freeCells = 0;    //Свободные ячейки времени
    let maxCells = 0;     //Максимально свободный неразрывный промежуток времени
    let addCells = 0;     //Свободные ячейки от 0 до первой несвободной ячейку
    let fromZero = true;  //Индикатор попадания на первую несвободную ячейку
    
    //Расчет максимально свободного промежутка времени
    dPowArr.forEach((item, idx) => {
      
      //Подсчитываем свободные ячейки времени
      devPow <= maxPow - item ? freeCells++ : freeCells = 0;
      
      //Подсчитываем свободные ячейки от 0 до первой несвободной
      fromZero && devPow <= maxPow - item ? addCells++ : fromZero = false;
      
      //Добавляем свободные ячейки от 0 к ячейкам в конце если на 23 часа существуют свободные ячейки и их кол-во не 24
      if (idx === 23 && freeCells !== 0 && freeCells !== 24)
        freeCells += addCells;
      
      //Записываем если свободно больше текущего максимума
      if (maxCells < freeCells)
        maxCells = freeCells;
  
    });
    
    //Выводим в консоль сообщение о невозможности добавления данного устройства в расписание 
    if (devPow > maxPow) {

      console.log(`Устройство: ${item.name}; id: ${devId};\nПревышена разрешенная мощность: ${devPow} > ${maxPow}`);
      timeAssigned = 25;  //Предотвращаем вход в цикл

    } else if (maxCells < devWorkH) {
      
      console.log(`Устройство: ${item.name}; id: ${devId};\nНедостаточно свободного времени!\nТребуется: ${devWorkH}ч; Доступно: ${maxCells}ч`);
      timeAssigned = 25;  //Предотвращаем вход в цикл
    }

    //Распределяем устройство по расписанию
    while(devWorkH > timeAssigned) {

      //Заглушка от бесконечного цикла
      iterations++;
      if (iterations > 1000) {
        console.log(`Устройство: ${item.name}; id: ${devId};\nНепредвиденная ошибка! Бесконечность!`);
        break;
      }
      
      //Отладочная информация
      //if (rates[ratesIdx]) {
      //  console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'rates[ratesIdx]from+TA+TP', rates[ratesIdx].from + timeAssigned + timePassed);       
      //}
      
      //Проверка на переходный с суток на сутки тариф
      if (rates[ratesIdx].from < rates[ratesIdx].to) {
        
        //Проверка возможности добавления устройства в текущий час расписания при наличии
        //достаточной нераспределенной мощности и не превышении границ времени текущего тарифа
        if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow <= maxPow && rates[ratesIdx].from + timeAssigned + timePassed < rates[ratesIdx].to) {

          //console.log(timeAssigned, timePassed, rates[ratesIdx]);

          JsonDummyOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
          dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

          rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
          timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

        //Если в текущий час нет свободной мощности
        } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow > maxPow) {

          timePassed++;  //Повышаем кол-во пропущенных часов

        //Если текущий час на границе двух тарифов
        } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {

          //Проверка на необходимость грубого поиска
          if (item.duration === 24 || searchIterations > 24) {

            //Проверка на наличие следующего тарифа в массиве дневных тарифов
            if (searchPlus && rates[ratesIdx + 1]) {

              ratesIdx++;  //Повышаем индекс массива

            } else {

              searchPlus = false;  //Отключаем возможность повышать индекс массива
              ratesIdx--;          //Понижаем индекс массива
            }

          } else {

            ratesIdx = searchEngine(rates, ratesIdx, item, true);  //Инициализируем поиск тарифа
            searchIterations++;                                    //Повышаем количество циклов поиска

          }

          devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
          timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
          timePassed = 0;            //Обнуляем кол-во пропущенных часов
        }
        
      } else if (rates[ratesIdx].from > rates[ratesIdx].to) {
        
        //Проверка на 24 часа
        if (rates[ratesIdx].from + timeAssigned + timePassed < 24) {
          
          //Проверка возможности добавления устройства в текущий час расписания при наличии
          //достаточной нераспределенной мощности и перехода через 0
          if (!(zeroPass) && dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow <= maxPow) {

            //console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDummyOut.schedule[rates[ratesIdx].from + timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
            dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

            rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
            timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

          //Если в текущий час нет свободной мощности
          } else if (dPowArr[rates[ratesIdx].from + timeAssigned + timePassed] + devPow > maxPow) {

            timePassed++;  //Повышаем кол-во пропущенных часов

          //Если текущий час на границе двух тарифов
          } else if (rates[ratesIdx].from + timeAssigned + timePassed >= rates[ratesIdx].to) {

            //Проверка на необходимость грубого поиска
            if (item.duration === 24 || searchIterations > 24) {

              //Проверка на наличие следующего тарифа в массиве дневных тарифов
              if (searchPlus && rates[ratesIdx + 1]) {

                ratesIdx++;  //Повышаем индекс массива

              } else {

                searchPlus = false;  //Отключаем возможность повышать индекс массива
                ratesIdx--;          //Понижаем индекс массива
              }

            } else {

              ratesIdx = searchEngine(rates, ratesIdx, item, true);  //Инициализируем поиск тарифа
              searchIterations++;                                    //Повышаем количество циклов поиска

            }

            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
          }
          
        } else {
          
          //Проверка на переход через 0
          if (!(zeroPass)) {
            
            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
            zeroPass = true;           //Изменяем показатель перехода
            
          }
          
          //Отладочная информация
          //console.log('Zdes bil Zero!', zeroPass);
          //if (rates[ratesIdx]) {
          //  console.log('TA', timeAssigned, 'DevH', devWorkH, 'TP', timePassed, 'rates[idx].from&to', rates[ratesIdx].from, rates[ratesIdx].to, 'TA+TP', timeAssigned + timePassed);       
          //}
          
          //Проверка возможности добавления устройства в текущий час расписания при наличии
          //достаточной нераспределенной мощности и не превышении границ времени текущего тарифа
          if (dPowArr[timeAssigned + timePassed] + devPow <= maxPow && timeAssigned + timePassed < rates[ratesIdx].to) {

            //console.log(timeAssigned, timePassed, rates[ratesIdx]);

            JsonDummyOut.schedule[timeAssigned + timePassed].push(devId);  //Добавляем устройство в расписание на текущий час
            dPowArr[timeAssigned + timePassed] += devPow;                  //Добавляем мощность устройства на текущий час в массив мощностей

            rateCalc(item, rates[ratesIdx].value);  //Рассчитываем затраты
            timeAssigned++;                         //Повышаем кол-во вписаных часов для текущего устройства

          //Если в текущий час нет свободной мощности
          } else if (dPowArr[timeAssigned + timePassed] + devPow > maxPow) {

            timePassed++;  //Повышаем кол-во пропущенных часов

          //Если текущий час на границе двух тарифов
          } else if (timeAssigned + timePassed >= rates[ratesIdx].to) {

            //Проверка на необходимость грубого поиска
            if (item.duration === 24 || searchIterations > 24) {

              //Проверка на наличие следующего тарифа в массиве дневных тарифов
              if (searchPlus && rates[ratesIdx + 1]) {

                ratesIdx++;  //Повышаем индекс массива

              } else {

                searchPlus = false;  //Отключаем возможность повышать индекс массива
                ratesIdx--;          //Понижаем индекс массива
              }

            } else {

              ratesIdx = searchEngine(rates, ratesIdx, item, true);  //Инициализируем поиск тарифа
              searchIterations++;                                    //Повышаем количество циклов поиска

            }

            devWorkH -= timeAssigned;  //Понижаем кол-во нераспределенных часов работы устройства
            timeAssigned = 0;          //Обнуляем кол-во распределенных часов работы устройства
            timePassed = 0;            //Обнуляем кол-во пропущенных часов
          }
        }
      }
    }
  });
  
  //Округляем значения в consumedEnergy до 4 знаков после запятой
  for (let key in JsonDummyOut.consumedEnergy.devices) {
    
    let numInp = JsonDummyOut.consumedEnergy.devices[key];
    let numOut = parseFloat(numInp.toFixed(4));
    
    JsonDummyOut.consumedEnergy.devices[key] = numOut;
  }
  
  let valueInp = JsonDummyOut.consumedEnergy.value;
  let valueOut = parseFloat(valueInp.toFixed(4));
  
  JsonDummyOut.consumedEnergy.value = valueOut;
  
  let JsonDataOut = JSON.stringify(JsonDummyOut);  //Преобразовываем макет выходных данных в JSON формат
  
  //console.log(dPowArr);
  
  return JsonDataOut;  //Возвращаем обработанные данные
}