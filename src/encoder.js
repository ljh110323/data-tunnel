import t2map from 'through2-map'
import chalk from 'chalk';

export function encode(transformed) {
  
  const transform = t2map(function(chunk, index) {
    // console.log('e ->', chunk ? chalk.green(chunk.toString()) : '');
    return chunk;
  });

  const { head, tail } = transformed || {};

  transform.on('pipe', src => {
    head && transform.write(`${head}`);
    
    src.on('error', (ex) => {
      console.error(ex);
      src.writeHead(400, src.headers).end(`[ERROR] problem with request: TRANSFORM stage.`);
    });

    src.on('end', () => {
      src.unpipe(transform);
      tail && transform.end(`${tail}`);
    });
  });

  return transform;
}

export function decode(movemented) {
  
  if(!movemented || !movemented.length) {
    return t2map(chunk => chunk);
  }

  // let count = 0;
  let drops = movemented.head_len || 0;
  let keeps = movemented.length;

  const recovers = t2map(function(chunk, index) {
    // console.log(++count);
    if(!chunk.length) return chunk;

    if(drops !== 0) {
      const moves = Math.min(drops, chunk.length);
      chunk = chunk.slice(moves);
      drops -= moves;
    }
    
    if(chunk.length && keeps !== 0) {
      const moves = Math.min(keeps, chunk.length);
      chunk = chunk.slice(0, moves);
      keeps -= moves;
      return chunk;
    }

    return null;
  });

  recovers.on('pipe', src => {
    src.on('error', (ex) => {
      console.error(ex);
      src.writeHead(400, src.headers).end(`[ERROR] problem with request: TRANSFORM stage.`);
    });

    src.on('end', () => {
      src.unpipe(recovers);
      recovers.end();
    });
  });

  return recovers;
}
