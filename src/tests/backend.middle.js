import chalk  from 'chalk'
import http   from 'http'
import fse    from 'fs-extra'
import path   from 'path'
import format from 'format-json-stream'
// load config
const PORT = 8080;
const UPSTREAM = ["127.0.0.1", 9080];

const _logging = path.join(process.cwd(), '.logs', 'trans-middle.json');
fse.ensureDirSync(path.dirname(_logging));

function onRequest(request, response) {
  console.log(`${chalk.green('[GATEWAY] >>>')} ${request.url}`);
  
  const { url, method, headers } = request;

  const options = {
    path: url, method, headers,
    hostname: UPSTREAM[0], port: UPSTREAM[1]
  };

  const proxy = http.request(options, feedback => {
    response.writeHead(feedback.statusCode, feedback.headers);
    feedback.pipe(response);
    console.log(`${chalk.green('......... <<< [GATEWAY] pullback')}`);
  });

  request.on('error', (e) => {
    const err_msg = `[ERROR] problem with request: ${e.message}`;
    console.error(chalk.yellow(err_msg));
    console.error(e);
    response.writeHead(400, headers).end(err_msg);
  });

  proxy.on('socket', () => {
    // request.pipe(format()).pipe(fse.createWriteStream(_logging));
    request.pipe(proxy);
  });

  proxy.on('error', (e) => {
    const err_msg = `[ERROR] problem with request: ${e.message}`;
    console.error(chalk.yellow(err_msg));
    console.error(e);
    proxy.end();
    response.writeHead(400, headers).end(err_msg);
  });
}

export default {
  serve: () => {
    console.log(chalk.blue(`"Middle BACKEND" mock "backend" running at ${PORT}`));
    return http.createServer(onRequest).listen(PORT);  // start service
  },
  PORT
}
