import chalk from 'chalk'
import { transform, movements, TEMPLATE } from './template'

const marker = 'jsonrpc-method';

export function filter(input_request, input_response, opts, { digin }) {
  const { url: input_path, method: input_method } = input_request;

  if(input_path === '/favicon.ico') {
    return input_response.writeHead(404).end();
  }

  if(input_path === '/test-page') {
    return input_response.writeHead(200, { 'Content-Type': 'text/html' }).end(page);
  }
  
  const { headers: input_headers } = input_request;

  const options = { ...opts,
    path: input_path, 
    method: input_method,
    headers: input_headers
  };

  if(marker in input_headers) {

    const jsonrpc = (input_headers[marker] || '').toUpperCase();
    
    if(TEMPLATE[jsonrpc]) {
      const data_length = input_headers['content-length'];
      const transformed = digin ? transform(input_headers, TEMPLATE[jsonrpc]) : movements(input_headers);

      const extras = digin ? { 'tunnel-size': [transformed.head_len, transformed.tail_len].join(',') } : {};

      options.headers = transformed.length ? { ...input_headers, ...extras,
        'content-length': digin ? Number(data_length) + transformed.length : transformed.length
      } : input_headers;

      return { options, transformed };
    }
    
  }
  
  return { options };
}

export function reset(response, { digin }) {
  const raw_headers = response.headers;

  if(marker in raw_headers) {
    const jsonrpc = (raw_headers[marker] || '').toUpperCase();
    
    if(TEMPLATE[jsonrpc]) {
      const data_length = raw_headers['content-length'];
      const movemented  = digin ? movements(raw_headers) : transform(raw_headers, TEMPLATE[jsonrpc]);

      const extras = digin ? {} : { 'tunnel-size': [movemented.head_len, movemented.tail_len].join(',') };
      
      const headers = movemented.length ? { ...raw_headers, ...extras,
        'content-length': digin ? movemented.length : Number(data_length) + movemented.length
      } : raw_headers
      
      return { headers, movemented };
    }
  }

  return { headers: raw_headers };
}