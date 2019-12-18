import program from 'commander'
import path    from 'path'
import fse     from 'fs-extra'
import chalk   from 'chalk'


import tunnel from './tunnel'

program.version('1.0.0.beta', '-v --version')
       .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf');

program.parse(process.argv);

if(program.config) {
  const conf_url = path.join(process.cwd(), program.config);
  if(fse.existsSync(conf_url)) {
    try {
      const configs = fse.readJSONSync(conf_url);
      console.log(chalk.green(`[DATA-TUNNEL] :: Load Configs.`))
      console.log(configs);
      tunnel.serve({ 
        digin: true, PORT: 80, UPSTREAM: ["127.0.0.1", 8080], 
        ...configs, 
        __env: { config_path: program.config } 
      });
    } catch(ex) {
      const err_msg = `[ERROR] problem with request: ${ex.message}`;
      console.error(err_msg);
      console.error(ex);
    }
  } else {
    console.error(`Plase use the correct config path! Got path [${conf_url}] dose not exists!`);
  }
}
