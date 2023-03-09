/*
Este codigo se ha realizado como medio de enseñanza firmado por Ignacio
*/

const AWS = require("aws-sdk");
const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');
const rp = require('request-promise');
var https = require('https')

//Intent para iniciar la skill
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {

        const speakOutput = "Mensaje de bienvnida, la respuesta del usuario activara los siguientes intents";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



//Intent para crear los recordatorios en este caso se crearen multiples recordatorios

const CreateReminderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GuardarRecordatoriosIntent';
    },
    async handle(handlerInput) {
       const { requestEnvelope, serviceClientFactory, responseBuilder, attributesManager } = handlerInput;
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const deviceId = requestEnvelope.context.System.device.deviceId;
    var veces= 0;
    let timezone, now, consentToken;
      const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient(),
    { permissions } = handlerInput.requestEnvelope.context.System.user
    
  /*
    Revisar si se han dado los permisos para recordatorios, en caso negativa pedir activarlos
  */
  
  
  if(!permissions) {
    return handlerInput.responseBuilder
      .speak("Por favor enciende los permisos de notificacion en la app de alexa")
      .withAskForPermissionsConsentCard(["alexa::alerts:reminders:skill:readwrite"])
      .getResponse()
  }


/*
const paquete = await httpGet(deviceId);
console.log(paquete)//Guardar en los log como ha llegado la data de los recordatorios   
*/

//Time zone para determinar en el horario que se trabajara los recordatorios
 const currentTime = moment().tz("America/Lima"); 

const paquete ={
  "data": {
    "name": "Nombre de la persona",
    "lastname": "Apellido de la persona",
    "Reminder": [
      {
        "Recordatorio": "Aqui va el primer recodatorio que se dara",
        "StartTimerRecodatorio": 11,
        "StarMinutesRecodatorio": 21,
        "frequency": 24
      },
      {
        "Recordatorio": "Aqui va el segundo recodatorio que se dara",
        "StartTimerRecodatorio": 14,
        "StarMinutesRecodatorio": 10,
        //la frecuencia es un valor que indica cada cuantas horas el recordatorio se dara dentro de un dia 
        "frequency": 24
      }
    ]
  }
}
 
// Comienzo del loop que revisa todos los tipos de medicamento que tiene el paciente 
 for (let i = 0; i < paquete.data.prescriptions.length; i ++){
 //var timedate = moment(currentTime).add(paquete.data.prescriptions[i].daysOfTreatment,'days');
 
//condicional que genera un valor de veces que se tendra que crear los recordatorios usando como valor la frecuencias
//Si la frecuencia es menor o igual a 12 se dividira 24/frecuencia en caso contrario solo se crearia 1 ves porque seria 24/24
 if (paquete.data.Reminder[i].frequency<=12){
 veces=24/paquete.data.Reminder[i].frequency

 }
 else{
     veces= 1
 }
 
// Comienzo del loop que revisa todas las horas que los recordatorios deben ser creados usando la catidad de veces se tiene que dar un recordatorio en un dia
 for (let y=0; y<veces; y++){
     var tiempo =y*paquete.data.Reminder[i].frequency;
     var horainicio= paquete.data.Reminder[i].StartTimerRecodatorio+tiempo;
     //condicional para revisar si algun recordatorio se crearia a una hora mayor a las 24 horas y reinciar el conteo a parti de la 1 am
     if (horainicio >=24){
         horainicio = horainicio-24;
     }
      try{
     const reminderRequest = {
        requestTime: currentTime.format("YYYY-MM-DDTHH:mm:ss"),
        trigger: {
          type: "SCHEDULED_ABSOLUTE", 
          timeZoneId: "America/Lima", // Configurar la zona horaria a Lima
          //linea que se encarga de definir a las horas que se deben crear los recordatorios
          recurrence : { recurrenceRules : [ "FREQ=DAILY;BYHOUR="+horainicio+";BYMINUTE="+paquete.data.Reminder[i].StarMinutesRecodatorio]}
          
        },
        alertInfo: {
          spokenInfo: {
            content: [{
              locale: "es-MX",
              text: "Hola "+ paquete.data.name +"Tu recordatorio es "+paquete.data.Reminder[i].Recordatorio,
            }]
          }
        },
        pushNotification: {
          status: "ENABLED"
        }
      }
      await remindersApiClient.createReminder(reminderRequest)
     
    }catch(err){
        console.log(err)
    }

     
 }
   
}
 
  return handlerInput.responseBuilder
          .speak("Perfecto ya guarde tus recordatorios "+paquete.data.name)
          .getResponse();    
    }
};


//Intent que se encarga de manejar un mensaje que termine la skill
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Hasta luego';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/**
 Este intetnt es generado por necesidad de manejo los errores que pueda tener el usuario al hacer la interaccion
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Perdona no pude entender lo que me dijiste. Puedes repetirlo';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
Se definen todos los intents que se crearan en la skill y las API de reminders
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateReminderIntentHandler,
        CancelAndStopIntentHandler
        )
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('reminders/v1')
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
// Funcion de GET API que permite recibir un paquete de datos, en el caso que se quiera remplazar hardcodig por una API 
    function httpGet() {
  return new Promise(((resolve, reject) => {
    var options = {
        host: 'un host',
        port: 443,
        path: "/service/plan",
        method: 'GET',
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}
     