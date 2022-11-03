// Jst
import * as fs from 'fs'

const str: string = `
import { <@antd = Tag/> } from 'antd';
@map<@fields/><export const <@field/> = "<@value/>";/>
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

class JST {
    operationFields: [
        'map',
        'if',
    ];

    matchVarious(str: string, startIndex: number = 0) {
        let startTagIndex: number  = -2;
        let endTagIndex: number = -2;

        for(let index = startIndex; index < str.length; index++) {
            if(
                str[index] === '<'
                && str[index + 1] === '@'
            ) {
                startTagIndex = index;
            }
            
            if(
                startTagIndex > -2
                && str[index] === '>'
                && index > 0
                && str[index - 1] === '/'
            ){
                endTagIndex = index;

                return {
                    startTagIndex,
                    endTagIndex,
                    content: JST.fragment(str, startTagIndex, endTagIndex + 1),
                }
            }
        }


        return null;
    }

    analyzeVarious(str: string) {
        const variousStr: string = JST.fragment(str, 2, str.length - 2).trim();

        let various: string;
        let defaultValue: string;

        for(let index = 0; index < variousStr.length; index++) {
            if(
                !various
                && (variousStr[index + 1] === ' ' || variousStr[index + 1] === '=' || index === variousStr.length - 1)
            )
            {
                various = JST.fragment(variousStr, 0, index + 1);
            }
            else if(
                various
                && index > -1
                && (variousStr[index - 1] === '=' || variousStr[index - 1] === ' ')
                && (variousStr[index] !== '=' && variousStr[index] !== ' ')
            ) {
                defaultValue = JST.fragment(variousStr, index, variousStr.length);
            }
        }

        return {
            type: 'various',
            various,
            defaultValue,
        }
    }

    // 需要考虑嵌套情况
    matchOperation(list: any[]) {
        let newList: any[] = [];

        for(let index = 0; index < list.length; index++) {
            const item: unknown = list[index];
            const isString = typeof item === 'string';

            if(!isString) {
                newList.push(item);

                continue;
            }
        }
    }

    compile(str: string) {
        let index: number = 0;
        let source: any[] = [];

        while(index < str.length) {
            const various: any = this.matchVarious(str, index);

            if(various) {
                const {
                    startTagIndex,
                    endTagIndex,
                    content,
                } = various;

                if(startTagIndex !== index) {
                    source.push(JST.fragment(str, index, startTagIndex));
                }

                source.push(this.analyzeVarious(content));

                index = endTagIndex + 1;
            }
            else {
                source.push(JST.fragment(str, index, str.length));
                index = str.length;
            }
        }

        return source;
    }

    static fragment(str: string, startIndex: number, endIndex: number = -1): string {
        let target: string = '';

        if(endIndex < 1) endIndex = str.length + endIndex;

        for(let i = startIndex; i < endIndex; i++) {
            target += str[i];
        }

        return target;
    }
}

const jst = new JST();

const result = jst.compile(str);

fs.writeFileSync('./result.json', JSON.stringify(result, null, 4));
