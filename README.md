# Alexa-Skill-Multiple-Reminder-Creation

This Repository helps the creation of multiple reminders on Alexa Skill

## Lo que se necesita antes de empezar

* Cuenta de Amazon Alexa Skill Develorper
* Un dispositivo Alexa (La aplciacion de Alexa para mobile funciona)

## Implementar el codigo

Ir a crear una nueva skill en Español-MX, con un template "from scratch" y en node.js. Despues cargar los archivos en la carpeta de lambda en la parte de codigo en la console. Despues cargar en Build->Interaction Model->JSON editor el archivo que se encuentra en custom->interactionsModels->es-MX.js
Todo debe ser guardado y posteriormente se tiene que ponerel los botones de deploy tanto en el build y en el code. Lo ultimo es ir a Build->Tootls->Permission, activaresmos el de recordatorios.

## Utilizar la Skill

Se tendra queusar la misma cuenta de Alexa Developer en el celuluar y se tendra que entrar al apartado de skill, developer y activar nuestras skill activando los permisos de recordatorios. Lo ultimo es utilizar el comando de voz para llamar nuestra skill, en este caso "inicio de prueba de recordatorios"
