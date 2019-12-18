import chalk from 'chalk'
import http  from 'http'

import page from './tests/index.html'

import { filter, reset} from './filter'
import { encode, decode, through } from './encoder'
import { transform, movements, plugin } from './template'

import HEADERS_OPTIONS from './headers/options.json'

function castOnRequest({ digin, UPSTREAM }) {

  return (input_request, input_response) => {
    console.log(`${digin ? '\n' : ''}${chalk.blue(`[${digin ? 'REQUEST' : '-TUNNEL'}] >>>`)} ${input_request.url}`);

    const { options, transformed } = filter(
      input_request, input_response,
      { hostname: UPSTREAM[0], port: UPSTREAM[1] },
      { digin }
    );

    const tunnel = http.request(options, res => {
      try {
        console.log(chalk.blue(`${digin ? '..GOT.!..' : '.BACK.!..'} <<< [-TUNNEL]`), digin ? '' : chalk.blue(`backward`));
      
        const { headers, movemented } = reset(res, { digin });
        input_response.writeHead(res.statusCode, headers);
        const brake = digin ? decode : encode;
        res.pipe(brake(movemented), { end: false }).pipe(input_response);

      } catch(ex) {
        const err_msg = `[ERROR] problem with request: ${ex.message}`;
        console.error(chalk.yellow(err_msg));
        console.error(ex);
        input_response.writeHead(400, res.headers).end(err_msg);
      }
    });

    tunnel.on('socket', () => {debugger
      const brake = digin ? encode : decode;
      input_request.pipe(brake(transformed), { end: false }).pipe(tunnel);
    });

    tunnel.on('error', (e) => {
      const err_msg = `[ERROR] problem with request: ${e.message}`;
      console.error(chalk.yellow(err_msg));
      console.error(e);
      tunnel.end();
      input_response.writeHead(400, input_request.headers).end(err_msg);
    });
  }

}

export default {
  serve: (confs) => {
    const PORT = confs.port;
    const UPSTREAM = confs.upstream;

    plugin(confs.template || {}, confs.__env.config_path);
    
    if(!PORT || !UPSTREAM) {
      throw new Error(`The "serve" funtion of tunnel's requires 2 inportant arguments which are PORT, UPSTREAM[host, host-prot]`);
      return;
    }
    
    console.log(chalk.blue(`"DATA-TUNNEL" serve at [PORT:${chalk.green(PORT)}], upstream ${confs.digin ? chalk.red(">>>") : chalk.green("<<<")} ${UPSTREAM.join(":")}`));
    return http.createServer(castOnRequest({ ...confs, PORT, UPSTREAM })).listen(PORT);  // start service
  }
}
