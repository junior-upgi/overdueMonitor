import $ from 'jquery';

import Person from './test.js';

let person = new Person('Junior');

console.log(person.sayHello());


class MyClass {
    sayHello() {
        return 'hello from ES6...!!!!';
    }
}
$('document').ready(function() {
    var myClass = new MyClass();
    $('h1#content').text(myClass.sayHello());
});
