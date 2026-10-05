import {createTimefallApp} from './app.js';
const runtime=createTimefallApp();const port=Number(process.env.PORT)||3000;await runtime.listen(port);console.log(`TIMEFALL M3 listening on port ${port}`);
let stopping=false;async function stop(){if(stopping)return;stopping=true;await runtime.close();process.exit(0);}process.on('SIGTERM',stop);process.on('SIGINT',stop);
