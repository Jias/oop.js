(function(glob) {
    // namespace
    var oop = {
        version: '1.0.0'
    };

    var noop = function () {},
        mixin = redo(mixin);

    // 向下兼容不支持Object.create的浏览器，只接受一个参数
    if (!Object.create) {
        Object.create = function(o) {
            if (arguments.length > 1) {
                throw new Error('Object.create implementation only accepts the first parameter.');
            }

            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    oop.create = function() {
        var arg0 = arguments[0],
            arg1 = arguments[1],
            arg2 = arguments[2],
            parent,
            config,
            statics;

        if (isClass(arg0)) {
            parent = arg0;
            config = arg1 || {};
            statics = arg2 || {};
        } else {
            parent = Object;
            config = arg0 || {};
            statics = arg1 || {};
        }

        config._init = config.hasOwnProperty('_init') ? config._init : noop;

        // 创建构造函数
        function Constructor() {
            this._init.apply(this, arguments);
        };

        // 创建指向父类构造函数的索引
        Constructor.Parent = parent;

        // 创建指向父类原型方法的索引
        Constructor.Super = parent.prototype;

        // 添加Constructor.toString的目的是：在控制台打印一个类时，避免打印构造函数的字符串
        Constructor.toString = function() {
            return Constructor.NAME + ' : ' + config._init.toString();
        };

        // 只继承父类的原型方法
        var proto = Constructor.prototype = Object.create(parent.prototype);

        // 修复constructor
        proto.constructor = Constructor;
        proto.Super = Constructor.Super;

        // 添加混合方法
        var protoMixin = config.mixin || 0;
        if (protoMixin) {
            for (var i = 0, l = protoMixin.length; i < l; i++) {
                mixin(proto, protoMixin[i]);
            }
        }
        // 不干扰原型方法
        delete config.mixin;
        // 添加原型方法
        mixin(proto, config);

        if (statics) {
            // 添加混合方法
            var staticMixin = statics.mixin || 0;
            if (staticMixin) {
                for (var i = 0, l = staticMixin.length; i < l; i++) {
                    mixin(Constructor, staticMixin[i]);
                }
            }
            delete statics.mixin;
            // 添加静态属性
            mixin(Constructor, statics);
        }

        return Constructor;
    }

    function isClass(obj) {
        return typeof obj === 'function' &&
        (obj.prototype && obj === obj.prototype.constructor);
    }

    // simple mixin
    function mixin(receiver, supplier) {
        if (Object.keys) {
            Object.keys(supplier).forEach(function(property) {
                Object.defineProperty(receiver, property, Object.getOwnPropertyDescriptor(supplier, property));
            });
        } else {
            for (var property in supplier) {
                if (supplier.hasOwnProperty(property)) {
                    receiver[property] = supplier[property];
                }
            }
        }
        return receiver;
    }

    // 变换两个参数的函数到多个参数
    // var add = function (x, y) { return x+y; }
    // add = redo(add);
    // add(1,2,3) => 6
    function redo(fn) {
        return function () {
            var args = arguments;
            var ret = fn(args[0], args[1]);
            for (var i=2, l=args.length; i<l; i++) {
                ret = fn(ret, args[i]);
            }
            return ret;
        }
    }

    (typeof module != "undefined" && module.exports) ?
        (module.exports = oop) :
        (typeof define === "function" && define.amd) ?
        define(oop) :
        (glob.oop = oop);
})(this);