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
  
  let ratesDMin;
  let ratesDArr = [];
  let ratesNMin;
  let ratesNArr = [];
  
  let iterationsa = 0;
  let iterationsb = 0;

  //Циклируем пока не найдем минимальный дневной тариф
  while (!(ratesDMin) && !(ratesNMin)) {
    
    //Заглушка от бесконечного цикла
    iterationsa++;
    if (iterationsa > 1) {
      ratesDMin = true;
      ratesNMin = true;
    }
    
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

    //Находим самый дешевый дневной тариф
    let firstItemD = ratesDArr[0].value;
    ratesDArr.forEach(function(item) {
      if (firstItemD > item.value) {
        firstItemD = item.value;
        ratesDMin = item;
      }
    });
    
    //Находим самый дешевый ночной тариф
    let firstItemN = ratesNArr[0].value;
    ratesNArr.forEach(function(item) {
      if (firstItemN > item.value) {
        firstItemN = item.value;
        ratesNMin = item;
      }
    });
  }
  console.log('Тарифы: ');
  console.log('ratesDArr: ', ratesDArr);
  console.log('ratesDMin: ', ratesDMin);
  console.log('ratesNArr: ', ratesNArr);
  console.log('ratesNMin: ', ratesNMin);
  
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
  console.log('Устройства: ');
  console.log('Day: ',devDArr);
  console.log('Night: ',devNArr);
  console.log('Undefined: ',devUArr);
  
  let dArrLen = devDArr.length;
  
  let iterationsc = 0;
  
  //Раскидываем дневные приборы 
  while(dArrLen > 0) {
    
    //Заглушка от бесконечного цикла
    iterationsc++;
    if (iterationsc > 4) {
      dArrLen = 0;
    }
    
    devDArr.forEach((item) => {
      let devWorkH = item.duration;
      if (ratesDMin.to - ratesDMin.from > devWorkH && JsonDataOut.schedule[ratesDMin.to].length === 0) {
        console.log('1');
      }
      
    });
  }
  
  return JsonDataOut;
}

window.onload = function() {
  console.log('window loaded!');
  
  smartHouse(JsonInp);
};