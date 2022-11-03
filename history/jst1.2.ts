// Jst
import * as fs from 'fs'

const str: string = `
import { <@antd = Tag/> } from 'antd';
@map[\n]<@fields/><export const <@field/> = "<@value/>";/>
`;

const str1: string = `
import { <@antd=Table/> } from 'antd';
`;

const compileData = [
    `import { `,
    {
        various: 'antd',
        defaultValue: '',
    },
    `} from 'antd';`,
    {
        various: 'fields',
        type: 'map',
        children: [
            `export const `,
            {
                various: 'field',
                defaultValue: '',
            },
            ' = "',
            {
                various: 'value',
                defaultValue: '',
            },
            '";'
        ]
    },

]

class List {
    parent: any;
    value: any[] = [];

    constructor(parent?: any) {
        this.parent = parent;
    }

    add(item: any) {
        this.value.push(item);
    }
}

class JstVarious {
    #str: string = '';
    #reg: RegExp = /([^\s=]+)\s*=?\s*([^\s=]*)/g
    #list: string[] = [];
    type:string = 'various';
    field: string = '';
    defaultValue: string = '';
    parent: any;

    constructor(parent: any,str?: string) {
        this.parent = parent;

        if(!str) return;

        this.#str = str;
        
        this.#list = this.#reg.exec(this.#str) || [];
    }

    get value() {
        return '';
    }

    set str(str: string) {
        this.#str = str;
        
        this.#list = this.#reg.exec(this.#str) || [];

        this.field = this.#list[1];
        this.defaultValue = this.#list[2];
    }
}

class JstConnector {
    #connectorRegExp = /^\[(.*)\]$/g;
    parent: any;
    value: any;

    constructor(parent: any) {
        this.parent = parent;
    }

    set str(str: string) {
        this.value = (this.#connectorRegExp.exec(str) || [])[1] || '\n';
    }
}

class JstMap {
    #connectorRegExp = /^\[(.*)\]$/g;
    type: string = 'map';
    various: JstVarious = new JstVarious(this);
    children: List = new List(this);
    connector: JstConnector = new JstConnector(this);
    parent: any;

    constructor(parent: any) {
        this.parent = parent;
    }
}

class JST {
    static getLastItem(list: any[]) {
        return list[list.length - 1];
    }

    compile(str: string) {
        let stack: List = new List(); // 带嵌套结构的数据
        let point: any = stack; // 指向当前操作方向
        let lastIndex: number = 0;

        const reg: RegExp = /\<@|\/\>|@(if|map)/g;
        let result;

        while((result = reg.exec(str)) && result) {
            const [ item ] = result;
            const { index } = result;

            const currentStr: string = str.substring(lastIndex, index);

            if(point instanceof List) {
                point.add(currentStr);
            }

            switch(item) {
                case '<@':
                    if(point instanceof List) {
                        stack.add(point);

                        point = new JstVarious(stack);
                    }
                    else if(point instanceof JstConnector) {
                        point.str = currentStr;

                        point = point.parent.various;
                    }

                    lastIndex = index + 2;

                    break;
                case '/>':
                    if(point instanceof JstVarious) {
                        point.str = currentStr;

                        point = point.parent;
                    }
                    else if(point instanceof JstMap) {
                        point = point.parent;
                    }
                    
                    if(point instanceof JstMap) {
                        lastIndex = index + 3;
                    }
                    else {
                        lastIndex = index + 2;
                    }

                    break;
                case '@map':
                    const jstMap = new JstMap(stack);
                    stack.add(jstMap);

                    point = jstMap.connector;

                    lastIndex = index + 3;

                    break;
                default:
            }
        }

        stack.add(str.substring(lastIndex, str.length + 1)); // 处理最后的文本

        return stack;
    }
}

const jst = new JST();

const result = jst.compile(str);


console.info(result)
// fs.writeFileSync('./result.json', JSON.stringify(result, null, 4));
