const Monitor = require('monitor');
const request = require('request');
const TITLE=process.env.TITLE;
const INTERVAL=process.env.INTERVAL;
const HEAP_HIGH =process.env.HEAP_HIGH;
const MEM_HIGH =process.env.MEM_HIGH;
const SH_OS =process.env.SH_OS;
const TOKEN = process.env.TOKEN;
const critical_StickerPkg = 2;
const critical_StickerId = 39;
const information_StickerPkg = 2;
const information_StickerId = 34;
var options = {
  probeClass: 'Process',
  initParams: {
    pollInterval: INTERVAL
  }
}
var processMonitor = new Monitor(options);
var stickerPkg=0; //stickerPackageId
var stickerId=0; //stickerId
processMonitor.on('change', () => {
  var sendNotify="N" //final decision to send notify
  var heapWarning="N" //flag for heap memory warning
  var memoryWarning="N" //flag for memory warning
  //collect OS information
  var hostName = processMonitor.get('hostname');
  var pID = processMonitor.get('pid');
  var platForm = processMonitor.get('platform');
  var upTime = processMonitor.get('uptime');
  var type = processMonitor.get('type');
  var totalMem = processMonitor.get('totalmem');
  totalMem=Number(((totalMem/1024)/1024).toFixed(1)); //Convert to MB
  var heapTotal = processMonitor.get('heapTotal');
  heapTotal=Number(((heapTotal/1024)/1024).toFixed(1)); //Convert to MB
  var titleMSG="\n"+TITLE+"("+pID+")"
  var osMSG="";
  var warnMSG="";
  //collect OS information
  //collect memory information
  var heapUsed = processMonitor.get('heapUsed');
  heapUsed=Number(((heapUsed/1024)/1024).toFixed(1)); //Convert to MB
  if(HEAP_HIGH<((heapUsed/heapTotal)*100)){heapWarning="Y";}
  var freeMem = processMonitor.get('freemem');
  freeMem=Number(((freeMem/1024)/1024).toFixed(1));
  var usedMem = totalMem-freeMem;
  usedMem=Number(usedMem.toFixed(1)); //Convert to MB
  if(MEM_HIGH<((usedMem/totalMem)*100)){memoryWarning="Y";}
  //collect memory information
  //Decision to show
  if (SH_OS=="Y"){
    sendNotify="Y";
    var stickerPkg=information_StickerPkg;
    var stickerId=information_StickerId;
    osMSG=osMSG+"\nOS Information:\nHostname: "+hostName+"\nPID:"+pID+"\nPlatform:"+platForm+"\nType of OS:"+type+"\nUptime:"+upTime+"\n";
    osMSG=osMSG+"Total Memory:"+totalMem+" MB\nTotal Heap Memory: "+heapTotal+" MB\n";
    osMSG=osMSG+"Free Memory:"+freeMem+" MB\nHeap Used Memory:"+heapUsed+" MB";
  }
  else {
    sendNotify="N";
    var stickerPkg=critical_StickerPkg;
    var stickerId=critical_StickerId;
    if(heapWarning=="Y"){
      sendNotify="Y";
      warnMSG=warnMSG+"\nHeap Memory Warning:\nCurrent Heap Used: "+heapUsed+" MB\n Total Heap: "+heapTotal+" MB";
    }
    if(memoryWarning=="Y"){
      sendNotify="Y";
      warnMSG=warnMSG+"\nMemory Used Warning:\nCurrent Used: "+usedMem+" MB\n Total Memory : "+totalMem+" MB";
    }
  }
  //Decision to show
  var msg = titleMSG+osMSG+warnMSG;
  if(sendNotify=="Y"){
  request({
     method: 'POST',
     uri: 'https://notify-api.line.me/api/notify',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
              },
     'auth': {
       'bearer': TOKEN
              },form: {
                        stickerPackageId:stickerPkg,
                        stickerId:stickerId,
                        message: msg
                      }
                        }, (err,httpResponse,body) => {
                                                      console.log(JSON.stringify(err));
                                                      console.log(JSON.stringify(httpResponse));
                                                      console.log(JSON.stringify(body));
                                                      })
                      }
          });
processMonitor.connect((error) => {
  if (error) {
    console.error('Error connecting with the process probe: ', error);
    process.exit(1);
  }
});
