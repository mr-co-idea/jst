import JST from "./jst";
import * as fs from 'fs';

const main = async () => {
    const jst = new JST();

    const data = JSON.parse(fs.readFileSync('./test/test.json', { encoding: 'utf-8' }));
    const temp = fs.readFileSync('./test/test.jst', { encoding: 'utf-8' });

    fs.writeFileSync('./test/compile.json', JSON.stringify(jst.compile(temp), null, 4))
    const result = jst.run(temp, data);

    fs.writeFileSync('./test/test.js', result);
}

main();