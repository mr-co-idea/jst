// Jst

const str: string = `import { <@antd/>} from 'antd';`

const data: object = {
    antd: 'Table',
}

class Constant {
    #value: string;

    constructor(value?: string) {
        this.#value = value;
    }

    get children(): any {
        return this.#value;
    }
}

class Chain {
    #value: any;
    #parent: Chain | undefined;

    constructor(value?: any, parent?: Chain) {
        this.#value = value;
        this.#parent = parent;
    }

    get value() {
        return this.#value;
    }

    get parent() {
        return this.#parent;
    }

    static search = (SearchObj: Chain, field: string) => {
        if(!SearchObj) return;

        const { value, parent } = SearchObj;

        if(value[field]) return value[field];

        return Chain.search(parent, field);
    }
}

class Various {
    #value: Chain; 
    #children: any;
    #field: string;

    constructor(value?: Chain, children?: string, field?: string) {
        this.#value = value;  
        this.#children = children;
        this.#field = field;
    }

    get children(): any {
        return Chain.search(this.#value, this.#field) || this.#value;
    }
}

class JstMap {
    #value: Various;
    #children: any;
    #link: string = '\n';


    constructor(value: Various, children?: any, link?: string) {
        this.#value = value;
        this.#children = children;
        this.#link = link;
    }

    get value() {
        return this.#value;
    }

    get children() {
        return this.#children;
    }

    get link() {
        return this.#link;
    }
}

class JstIf {
    #value: any = false;
    #children: any;
    constructor(value?:any, children?: any) {
        this.#value = value;
        this.#children = children; 
    }

    get value() {
        return this.#value;
    }

    get children() {
        return this.#children;
    }
}

const struction: any = [
]

const list = [
    new Constant('import { '),
    new Various(new Chain(data), 'antd'),
    new Constant(`} from 'antd';`),
]

class Jst {
    static typeof(item: any) {
        if(item instanceof Constant) {
            
        }
    }
}

export default Jst;