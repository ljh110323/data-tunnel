import path  from 'path'
import fse   from 'fs-extra'
import chalk from 'chalk'
import query_json          from './jsons/query.json'
import query_response_json from './jsons/query.response.json'

export const place_holder = '"<%tunnel-payload%>"';

export const TEMPLATE = {
  'QUERY': query_json,
  'QUERY-RESPONSE': query_response_json
};

export function plugin(templates, base) {
  const dir = path.parse(base).dir;
  Object.keys(templates).forEach(t => {
    const name = t.toUpperCase();
    const road = path.join(dir, templates[t]);
    if(fse.pathExistsSync(road)) {
      TEMPLATE[name] = fse.readJSONSync(road);
    } else {
      console.warn(`Load template error :: ${road}`);
    }
  });
}

export function transform(session, template) {
  debugger;
  const raws = JSON.stringify(template);
  const keys = Object.keys(session);
  const [head, tail] = keys.reduce((acc, key) => acc = acc.replace(`{{${key}}}`, session[key]), raws).split(place_holder);
  const head_len = Buffer.byteLength(head);
  const tail_len = Buffer.byteLength(tail);
  return { 
    head, tail, 
    head_len, tail_len,
    length: head_len + tail_len 
  };
}

export function movements(session) {
  const { 'content-length': content_length, 'tunnel-size': tunnel_size } = session;
  
  if(!content_length || !tunnel_size) {
    return {};
  }
  const lens = tunnel_size ? tunnel_size.split(',').map(i => Number(i)) : null;
  
  return lens 
       ? {
           head_len: lens[0], 
           tail_len: lens[1], 
           length: Number(content_length) - lens[0] - lens[1]
        } : {};
}