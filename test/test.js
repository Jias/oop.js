describe('oop.create', function () {

    var eve = (function () {
        var pre = '__';

        var Event = {
            on : function () {
                var t    = this;
                var args = arguments;
                if (typeof args[0] === 'string' && typeof args[1] === 'function') {
                    var type = rename(args[0]);
                    t[type]  = t[type] || [];
                    t[type].push(args[1]);
                } else if (typeof args[0] === 'object') {
                    var hash = args[0];
                    for (var i in hash) {
                        t.on(i, hash[i]);
                    }
                }
            },
            off : function (type, fn) {
                var t = this;
                var type = rename(type);
                if (!fn) {
                    delete t[type];
                } else {
                    var fns = t[type];
                    fns.splice(fns.indexOf(fn), 1);
                    if (!t[type].length) delete t[type];
                }
            },
            // @param {array} args
            fire : function (type, args, context) {
                var t = this;
                var fns = t[rename(type)];
                if (!fns) return 'NO_EVENT';
                for (var i=0, fn; fn = fns[i]; i++) {
                    fn.apply(context || t, [].concat(args));
                }
            },
            hasEvent : function (type) {
                return !!this[rename(type)];
            }
        };

        function rename (type) { return pre + type; }

        return Event;
    })();

    // start 
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

    it('auto init', function(){
        expect(person.name).to.be('person:foo');
    });

    it('call method', function(){
        expect(person.getName()).to.be('person:foo');
    });

    it('instanceof', function(){
        expect(person instanceof Person).to.be(true);
    });

    it('the same Super', function(){
        expect(person.Super).to.be(Person.Super);
    });

    it('check constructor\'s parent value', function(){
        expect(Person.Parent).to.be(Object);
    });

    it('check constructor\'s Super value', function(){
        expect(Person.Super).to.be(Object.prototype);
    });

    it('static NAME', function(){
        expect(Person.NAME).to.be('Person');
    });

    it('check prototype.constructor', function(){
        expect(Person.prototype.constructor).to.be(Person);
    });

    var Man = oop.create(Person, {
        _init : function (options) {
            // 调用父类构造
            // 如果Man有子类，且子类_init中也调用的父类的_init，则下面这句会死循环。
            // this.Super.init.call(this, options);
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

    it('auto init, call override method', function(){
        expect(man.name).to.be('man:boo');
    });

    it('call parent method', function(){
        expect(man.getName()).to.be('man:boo');
    });

    it('call method', function(){
        expect(man.getTodo(true)).to.be('Working Hard');
    });

    it('instanceof', function(){
        expect(man instanceof Man).to.be(true);
    });

    it('instanceof', function(){
        expect(man instanceof Person).to.be(true);
    });

    it('the same Super', function(){
        expect(man.Super).to.be(Man.Super);
    });

    it('check constructor\'s parent value', function(){
        expect(Man.Parent).to.be(Person);
    });

    it('check constructor\'s Super value', function(){
        expect(Man.Super).to.be(Person.prototype);
    });

    it('static NAME', function(){
        expect(Man.NAME).to.be('Man');
    });

    it('check prototype.constructor', function(){
        expect(Man.prototype.constructor).to.be(Man);
    });

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

    console.dir(boy);

    it('auto init, call parent method, call override method', function(){
        expect(boy.name).to.be('boy:woo');
    });

    it('call parent\'s parent method 不该出现死循环!!!', function(){
        expect(boy.getName()).to.be('boy:woo');
    });

    it('call parent\'s parent method', function(){
        expect(boy.getTodo2()).to.be('Doing Homework');
    });

    it('instanceof', function(){
        expect(boy instanceof Boy).to.be(true);
    });

    it('instanceof', function(){
        expect(boy instanceof Man).to.be(true);
    });

    it('instanceof', function(){
        expect(boy instanceof Person).to.be(true);
    });

    it('the same Super', function(){
        expect(boy.Super).to.be(Boy.Super);
    });

    it('check constructor\'s parent value', function(){
        expect(Boy.Parent).to.be(Man);
    });

    it('check constructor\'s Super value', function(){
        expect(Boy.Super).to.be(Man.prototype);
    });

    it('static NAME', function(){
        expect(Boy.NAME).to.be('Boy');
    });

    it('check prototype.constructor', function(){
        expect(Boy.prototype.constructor).to.be(Boy);
    });


    var dinnerCall = 0;
    var dinnerFn = function () {
        // this === boy
        dinnerCall++;
    };
    
    // 绑定事件，触发事件
    boy.on('dinner', dinnerFn);
    boy.fire('dinner');

    it('check event called times', function(){
        expect(dinnerCall).to.be(1);
    });

    // 解绑事件
    boy.off('dinner', dinnerFn);
    boy.fire('dinner');

    it('check event called times', function(){
        expect(dinnerCall).to.be(1);
    });

});

