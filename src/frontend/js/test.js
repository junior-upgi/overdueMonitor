export default class MyClass {
    constructor(name) {
        this._name = name;
    };

    sayHello() {
        return `Hello ${this._name} from ES6`;
    }
}
