import chalk  from 'chalk'
import http   from 'http'
import fse    from 'fs-extra'
import path   from 'path'
import t2map  from 'through2-map'
import format from 'format-json-stream'

import response_json from './response.json'
import { place_holder, query_response_head, query_response_tail } from '../template'

import { data1 } from './database'

const _logging = path.join(process.cwd(), '.logs', 'backend.json');
fse.ensureDirSync(path.dirname(_logging));

// load config
const PORT = 9090;

function onRequest(request, response) {
  console.log(`${chalk.red('[SERVICE] >>>')} ${request.url}`);
  
  request.pipe(t2map(chunk => chunk));

  request.on('error', (e) => {
    const err_msg = `[ERROR] problem with request: ${e.message}`;
    console.error(chalk.yellow(err_msg));
    console.error(e);
    response.writeHead(400, headers).end(err_msg);
  });

  request.on('end', function() {
    console.log(`${chalk.red('......... <<< [SERVICE] response')}`);

    try {
      const result = JSON.stringify(data1);
      
      response.writeHead(200, {
        'jsonrpc-method': 'query-response',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(result)
      });
      response.end(result);
    } catch (er) {
      response.statusCode = 400;
      return response.end(`error: ${er.message}`);
    }

  });
  
}

export default {
  serve: () => {
    console.log(chalk.blue(`"Service BACKEND" mock "backend" running at ${PORT}`));
    return http.createServer(onRequest).listen(PORT);  // start service
  }, 
  PORT
}