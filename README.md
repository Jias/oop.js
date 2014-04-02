# oop.js

用于创建通用类的模块

## 特点

* 子类构造函数和子类实例对象都可以通过`Super`属性访问到父类构造函数的prototype对象所指向的对象。方便复杂情况的调用。（比较拗口，看下面的代码就比较简单）
* 使用`Parent`作为指向父类构造函数的`key`，语意更明确。
* 支持`mixin`。
* 压缩后小于1k。

## 语法

#### 类定义

`oop.create(config)`  
`oop.create(config, statics)`

* config: {Object} optional 原型方法
	- mixin: {Array} 合并可复用的对象的方法，所有从该类创建的实例都拥有该方法
	- _init: {Function} 初始化函数，注意，真正的构造函数是由Class返回的，init是被构造函数调用的
	- otherMethod: {Function} 其他自定义的原型方法
* statics : {Object} optional 静态属性
   - NAME: {String} 定义类的名称
   - other: {Mixed} 其他自定义的静态属性或方法

Demo: 定义一个`Person`类

    var Person = oop.create({
        _init : function (options) {
            this.setName(options.name);
        },
        setName : function (name) {
            this.name = 'person:' + name;
        },
        getName : function () {
            return this.name;
        }
    },{
        NAME : 'Person'
    });

    var person = new Person({
        name : 'foo'
    });
    
    person.getName(); // 'person:foo'


#### 类继承

`oop.create(parent, config)`  
`oop.create(parent, config, statics)`

* parent: {Class} 指定继承于哪个父类，若没有指定，则默认继承于Object对象
* config: 同上。
* statics: 同上。

Demo: 定义一个类`Man`，它继承了`Person`类，并重写的`setName`方法。

    var Man = oop.create(Person, {
        _init : function (options) {
            // 调用父类构造
            Man.Super._init.call(this, options);
            this.setTodo(options.todo);
        },
        // override method
        setName : function (name) {
            this.name = 'man:' + name;
        },
        // new method
        setTodo : function (todo) {
            this.todo = this.todo || [];
            this.todo.push(todo);           
        },
        // new method
        getTodo : function (stringify) {
            return stringify ? this.todo.join(' / ') : this.todo;
        }
    },{
        NAME : 'Man'
    });

    var man = new Man({
        name : 'boo',
        todo : 'Working Hard'
    });
    
    man.getName(); // 'man:boo'
    console.log(man.Super === Man.Super); // true

#### 调用父类原型方法

`.Super.method.call(this, options)`

通过当前类，或当前类的实例的`Super`属性，都可以调用父类方法。即`Super`属性内部指向父类的prototype对象。

    当前类的实例.Super.method.call(this, options);
    当前类.Super.method.call(this, options);
 
Demo: 定义一个类`Boy`，它继承了`Man`类，并重写的`setName`方法。

    var Boy = oop.create(Man, {
        mixin : [eve],
        _init : function (options) {
            Boy.Super._init.call(this, options);
        },  
        // override method
        setName : function (name) {
            this.name = 'boy:' + name;
        },
        // only for demo
        getTodo2 : function () {
            return Boy.Super.getTodo.call(this, true);
        }
    },{
        NAME : 'Boy'
    });
    var boy = new Boy({
        name : 'woo',
        todo : 'Doing Homework'
    });
    

【注意】：对于两层以上的继承，`this.Super.xxx`写法必定导致死循环。如上面的示例中，`Boy`继承了`Man`，`Man`继承了`Person`，构成了两层继承，所以`Boy`类在调用父类方法时，应该使用`Boy.Super._init`调用父类构造方法。

    _init : function () {
        this.Super._init.call(this, options); // 导致死循环
    } 
   
#### 调用父类静态方法/属性

`.Parent.method()`/`.Parent.attribute`

通过当前类的`Parent`属性，可以调用父类的静态属性或方法。即`Parent`属性内部指向父类的构造函数。

    当前类.Parent.method()
    当前类.Parent.attribute


## 更新记录

* 2013-07-27 : 
    - 创建文档
* 2013-08-14 : 
    - 添加调用父类原型方法和静态属性的说明

