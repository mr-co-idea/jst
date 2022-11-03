// Jst

class JstText {
    type: string = 'text';
    parent: any;
    value: string = '';

    constructor(parent?: any, text?: string) {
        this.parent = parent;
        this.value = text;
    }
}

class JstList {
    type: string = 'list';
    parent: any;
    value: any[] = [];

    constructor(parent?: any) {
        this.parent = parent;
    }

    push(item: any) {
        this.value.push(item);
    }
}

class JstVariate {
    type: string = 'variate';
    parent: any;
    field: string;
    defaultValue: string;

    constructor(parent?: any) {
        this.parent = parent;
    }

    set variate(str: string) {
        const result: string[] = /([^=\s]+)\s*=?\s*([^=]*)/g.exec(str) || [];

        this.field = result[1];
        this.defaultValue = result[2];
    }
}

class JstConnector {
    type: string = 'connector';
    parent: any;
    value: string;

    constructor(parent?: any) {
        this.parent = parent;
    }

    set connector(str: string) {
        this.value = (/^\[(.*)\]$/g.exec(str) || [])[1] || ',';
    }
}

class JstMap {
    type: string = 'map';
    parent: any;
    variate: JstVariate = new JstVariate(this);
    connector: JstConnector =  new JstConnector(this);
    value: JstList =  new JstList(this);

    constructor(parent: any) {
        this.parent = parent;
    }
}

class JstCondition {
    type: string = 'condition';
    parent: any;
    value: string;

    constructor(parent?: any) {
        this.parent = parent;
    }

    set condition(str: string) {
        this.value = (/^\[(.*)\]$/g.exec(str) || [])[1] || '';
    }
}

class JstIf {
    type: string = 'if';
    parent: any;
    variate: JstVariate = new JstVariate(this);
    condition: JstCondition =  new JstCondition(this);
    value: JstList =  new JstList(this);

    constructor(parent: any) {
        this.parent = parent;
    }
}

export default class JST {
    compile(str: string) {
        let stack: JstList = new JstList(); // 带嵌套结构的数据
        let point: any = stack; // 指向当前操作方向
        let lastIndex: number = 0;

        const reg: RegExp = /\<@|@\>|@(if|map)/g;
        let result;

        while((result = reg.exec(str)) && result) {
            const [ item ] = result;
            const { index } = result;

            const currentStr: string = str.substring(lastIndex, index);
            const text = new JstText(point, currentStr);

            const {
                type,
            } = point;

            if(
                type === 'list' 
                && currentStr
            ) {
                point.push(text);
            }

            switch(item) {
                case '<@':
                    lastIndex = index + 2;

                    if(type === 'list') {
                        const variate: JstVariate = new JstVariate(point);

                        point.push(variate);

                        point = variate;
                    }
                    else if(type === 'connector') {
                        point.connector = currentStr;

                        point = point.parent.variate;
                    }
                    else if(type === 'condition') {
                        point.condition = currentStr;

                        point = point.parent.variate;
                    }

                    break;
                case '@>':
                    lastIndex = index + 2;

                    if(type === 'variate') {
                        point.variate = currentStr;

                        point = point.parent;

                        if(['map', 'if'].includes(point.type)) {
                            point = point.value;

                            lastIndex++;
                        };
                    }
                    else if(['map', 'if'].includes(point.parent.type)) {
                        point = point.parent.parent;
                    }

                    break;
                case '@map':
                    const jstMap = new JstMap(point);

                    point.push(jstMap);

                    point = jstMap.connector;

                    lastIndex = index + 4;

                    break;

                case '@if':
                    const jstIf = new JstIf(point);

                    point.push(jstIf);

                    point = jstIf.condition;

                    lastIndex = index + 3;

                    break;
                default:
            }
        }

        if(lastIndex < str.length) stack.push(new JstText(stack, str.substring(lastIndex, str.length + 1))); // 处理最后的文本

        return JST.removeParentForItem(stack);
    }

    execute(item: any, data?: any) {
        const {
            type,
        } = item;

        switch(type) {
            case 'list': 
                return item.value.map(val => this.execute(val, data)).join('');
            case 'map':
                return data[item.variate.field].map(val => this.execute(item.value, val)).join(this.execute(item.connector).replace(/\\n/g, '\n')); // 处理换行符
            case 'if':
                const conditionValue = this.execute(item.condition);
                const ifVarious = data[item.variate.field];

                if(
                    !conditionValue && ifVarious
                    || conditionValue === '!' && !ifVarious
                    || conditionValue === ifVarious && ifVarious
                )  return this.execute(item.value, data)

                return '';
            case 'text':
            case 'connector':
            case 'condition':
                return item.value;
            case 'variate':
                return JST.transformObjToString(data[item.field]) || item.defaultValue;
        }
    }

    run(str: string, data: any): string {
        return this.execute(this.compile(str), data);
    }

    static removeParentForItem(item: any) {
        if(typeof item === 'string' || !item) return item;

        if(Array.isArray(item)) return JST.removeParentForList(item);

        const newItem = {};

        for(let key in item) {
            if(key === 'parent') continue;

            newItem[key] = JST.removeParentForItem(item[key]);
        }

        return newItem;
    }

    static removeParentForList(list: any[]) {  
        return list.map(item => JST.removeParentForItem(item));
    }

    static getType(obj: any): string {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    static transformObjToString(obj, space = 4, index = 1) {
        const type = JST.getType(obj);

        if (type === 'String') return /@\{(.+)\}/gs.test(obj) ? /@\{(.+)\}/gs.exec(obj)[1] : `"${obj}"`;;

        if (type === 'Array') {
            return `[${obj.join(',\u0020')}]`;
        }

        if (type !== 'Object') return obj;

        let attrs = [];

        for (let key in obj) {
            attrs.push(`${'\u0020'.repeat(space * index)}${key}: ${JST.transformObjToString(obj[key], space, index + 1)}`)
        }

        if (attrs.length === 0) return `{}`;

        return `{\n${attrs.join(',\n')}\n${'\u0020'.repeat(space * (index - 1))}}`;
    }
}